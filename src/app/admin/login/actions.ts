"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { headers } from "next/headers";

export interface LoginActionResult {
  error?: string;
  rateLimited?: boolean;
}

export async function loginAction(
  _prevState: LoginActionResult | undefined,
  formData: FormData
): Promise<LoginActionResult | undefined> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  // Rate limiting: 5 attempts per 15 minutes per IP
  const rateCheck = checkRateLimit(ip, 5, 15 * 60 * 1000);
  if (!rateCheck.success) {
    return {
      error: `Too many failed attempts. Please try again in ${rateCheck.resetInSeconds} seconds.`,
      rateLimited: true,
    };
  }

  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";
  const callbackUrl = (formData.get("callbackUrl") as string) || "/admin";

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "An unexpected authentication error occurred." };
      }
    }
    // Re-throw redirect errors so Next.js handles navigation
    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}

