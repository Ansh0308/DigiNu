import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnauthorized } from "@/lib/api-response";

/**
 * GET /api/admin/ai/credits
 *
 * Fetches the current AI credit balance and monthly allowance for the restaurant.
 */
export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  const profile = await prisma.restaurantProfile.findFirst({
    select: {
      aiCreditsBalance: true,
      aiCreditsMonthlyLimit: true,
    },
  });

  return apiSuccess({
    aiCreditsBalance: profile?.aiCreditsBalance ?? 0,
    aiCreditsMonthlyLimit: profile?.aiCreditsMonthlyLimit ?? 30,
  });
}

