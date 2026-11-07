import { LoginForm } from "@/components/admin/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner Login — DigiNu",
  description: "Sign in to manage your digital restaurant menu.",
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = await searchParams;
  const callbackUrl = resolvedParams?.callbackUrl || "/admin";

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[var(--canvas-bg)]">
      <LoginForm callbackUrl={callbackUrl} />
    </main>
  );
}
