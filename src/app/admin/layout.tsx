import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "DigiNu — Owner Portal",
  description: "Restaurant management dashboard for digital menu administration.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}
