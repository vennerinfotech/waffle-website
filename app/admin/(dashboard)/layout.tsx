import { createClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export const dynamic = "force-dynamic";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    user = currentUser;
  } catch (error) {
    console.error("Dashboard layout authentication check failed:", error);
  }

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <AdminLayoutClient userEmail={user?.email}>
      {children}
    </AdminLayoutClient>
  );
}
