import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function QRCodeRedirectPage() {
  redirect("/admin/qr-studio");
}

