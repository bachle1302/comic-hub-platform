import { ReactNode } from "react";
import { RequireAdmin } from "@/features/auth";
import { AdminSidebar } from "@/widgets/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAdmin>
      <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <AdminSidebar />
        <section className="min-w-0">{children}</section>
      </div>
    </RequireAdmin>
  );
}
