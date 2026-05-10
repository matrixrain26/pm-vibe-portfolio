import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";
import AdminEditor from "./ui";

export default async function AdminPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const content = await getSiteContent();
  return <AdminEditor initialContent={content} />;
}
