import { prisma } from "@/lib/prisma";

/**
 * DigiNu — Durable AI Credit Lifecycle & Reservation Manager
 *
 * Implements persistent, ACID-compliant credit reservation and lifecycle tracking
 * backed by PostgreSQL (ai_generation_logs table).
 *
 * APPROVED CREDIT RULES (BUILD-05):
 * 1. Generation Request Fails -> Refund 1 credit.
 * 2. Cloudflare Timeout or Invalid Response -> Refund 1 credit.
 * 3. Successful Generation Returns Valid Image -> Permanently consume 1 credit.
 * 4. Owner Closes Preview -> Credit REMAINS consumed.
 * 5. Owner Discards Generated Image -> Credit REMAINS consumed.
 * 6. Owner Regenerates -> Discards previous candidate, new request consumes another credit.
 * 7. Owner Approves Image -> Image applied to dish, no additional generation credit consumed.
 *
 * DURABLE STATE TRANSITIONS:
 * RESERVED   -> GENERATING -> GENERATED -> APPROVED  (Permanent consumption)
 *                           -> GENERATED -> DISCARDED (Permanent consumption, audit retained)
 *            -> GENERATING -> REFUNDED  (Generation failed/timeout -> exactly-once refund)
 * RESERVED   -> REFUNDED   (Aborted before dispatch -> exactly-once refund)
 */

export type AIGenerationStatus =
  | "RESERVED"
  | "GENERATING"
  | "GENERATED"
  | "APPROVED"
  | "DISCARDED"
  | "FAILED"
  | "REFUNDED";

const RESERVATION_STALE_MS = 15 * 60 * 1000; // 15 minutes timeout lease

/**
 * Atomically reserves 1 credit in PostgreSQL and creates a durable AIGenerationLog record.
 * Concurrency Safe: Uses SQL conditional decrement (WHERE ai_credits_balance >= 1).
 */
export async function reserveCredit(
  menuItemId: string,
  promptSynthesized: string
): Promise<{ success: boolean; reservationId?: string; error?: string }> {
  return await prisma.$transaction(async (tx) => {
    // 1. Conditional atomic decrement
    const profileUpdate = await tx.restaurantProfile.updateMany({
      where: {
        singletonKey: "RESTAURANT_PROFILE_SINGLETON",
        aiCreditsBalance: { gte: 1 },
      },
      data: {
        aiCreditsBalance: { decrement: 1 },
      },
    });

    if (profileUpdate.count === 0) {
      return {
        success: false,
        error: "INSUFFICIENT_CREDITS",
      };
    }

    // 2. Persist durable reservation record in PostgreSQL
    const log = await tx.aIGenerationLog.create({
      data: {
        menuItemId,
        promptSynthesized,
        providerModel: process.env.AI_MODEL_ID || "@cf/black-forest-labs/flux-1-schnell",
        neuronsConsumed: 250,
        status: "RESERVED",
      },
    });

    return {
      success: true,
      reservationId: log.id,
    };
  });
}

/**
 * Transitions a reservation from RESERVED to GENERATING.
 */
export async function markGenerating(reservationId: string): Promise<boolean> {
  const result = await prisma.aIGenerationLog.updateMany({
    where: {
      id: reservationId,
      status: "RESERVED",
    },
    data: {
      status: "GENERATING",
    },
  });
  return result.count > 0;
}

/**
 * Transitions a reservation to GENERATED upon receiving valid image bytes from Cloudflare.
 * INVARIANT: Credit is now PERMANENTLY consumed. Subsequent dismissals or regenerations
 * will NOT refund this credit.
 */
export async function markGenerated(
  reservationId: string,
  candidateHash?: string
): Promise<boolean> {
  const result = await prisma.aIGenerationLog.updateMany({
    where: {
      id: reservationId,
      status: "GENERATING",
    },
    data: {
      status: "GENERATED",
      candidateHash: candidateHash || null,
    },
  });
  return result.count > 0;
}

/**
 * Executes a guaranteed exactly-once refund if generation failed or timed out.
 * Idempotent & Concurrency-Safe:
 * - Only refunds if the current status in PostgreSQL is strictly RESERVED or GENERATING.
 * - If status is already REFUNDED, GENERATED, APPROVED, or DISCARDED, the update count is 0
 *   and NO credit increment occurs.
 */
export async function refundFailedGeneration(
  reservationId: string,
  errorMessage?: string
): Promise<boolean> {
  return await prisma.$transaction(async (tx) => {
    const updateResult = await tx.aIGenerationLog.updateMany({
      where: {
        id: reservationId,
        status: { in: ["RESERVED", "GENERATING"] },
      },
      data: {
        status: "REFUNDED",
        errorMessage: errorMessage || "Generation failed",
      },
    });

    // If update count is 0, this request was either already refunded or already generated
    if (updateResult.count === 0) {
      return false;
    }

    // Exactly-once increment
    await tx.restaurantProfile.updateMany({
      where: { singletonKey: "RESTAURANT_PROFILE_SINGLETON" },
      data: {
        aiCreditsBalance: { increment: 1 },
      },
    });

    return true;
  });
}

/**
 * Marks a generated image candidate as DISCARDED when the owner closes the modal
 * or requests a regeneration.
 * INVARIANT: The credit remains consumed. Zero refund is issued.
 */
export async function discardCandidate(reservationId: string): Promise<boolean> {
  const result = await prisma.aIGenerationLog.updateMany({
    where: {
      id: reservationId,
      status: "GENERATED",
    },
    data: {
      status: "DISCARDED",
    },
  });
  return result.count > 0;
}

/**
 * Checks whether a reservation in PostgreSQL is valid and ready for approval.
 */
export async function isReadyForApproval(
  reservationId: string,
  menuItemId: string
): Promise<boolean> {
  const record = await prisma.aIGenerationLog.findUnique({
    where: { id: reservationId },
    select: { status: true, menuItemId: true },
  });

  return Boolean(
    record &&
      record.status === "GENERATED" &&
      record.menuItemId === menuItemId
  );
}

/**
 * Sweeps orphaned/stale reservations left in RESERVED or GENERATING states due to
 * unexpected server termination or aborted network requests.
 * Runs on durable database state, ensuring multi-instance consistency.
 */
export async function recoverStaleReservations(): Promise<number> {
  const cutoff = new Date(Date.now() - RESERVATION_STALE_MS);

  const staleRecords = await prisma.aIGenerationLog.findMany({
    where: {
      status: { in: ["RESERVED", "GENERATING"] },
      createdAt: { lt: cutoff },
    },
    select: { id: true },
  });

  let recoveredCount = 0;
  for (const record of staleRecords) {
    const refunded = await refundFailedGeneration(
      record.id,
      "Automated recovery: generation lease expired"
    );
    if (refunded) recoveredCount++;
  }

  return recoveredCount;
}
