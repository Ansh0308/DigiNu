import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { CancelAISchema } from "@/types/validation";
import { discardCandidate } from "@/lib/ai-credit-manager";
import { apiError, apiSuccess, apiUnauthorized, apiValidationError } from "@/lib/api-response";

/**
 * POST /api/admin/ai/discard
 *
 * Discards a generated image candidate when an owner closes the preview modal
 * or requests a regeneration.
 *
 * CRITICAL BUSINESS INVARIANT:
 * - A successful generation permanently consumes its credit.
 * - Discarding a candidate transitions the AIGenerationLog status to "DISCARDED".
 * - NO refund is issued. The credit remains consumed.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON", 400);
  }

  const parsed = CancelAISchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { reservationId } = parsed.data;
  const discarded = await discardCandidate(reservationId);

  return apiSuccess({
    reservationId,
    discarded,
    creditConsumed: true,
  });
}

