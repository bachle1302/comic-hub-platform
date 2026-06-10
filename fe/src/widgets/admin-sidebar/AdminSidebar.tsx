"use client";

import { usePathname } from "next/navigation";
import { AdminLink } from "@/shared/ui/AdminLink";

const links = [
  { href: "/admin", label: "Bảng điều khiển" },
  { href: "/admin/users", label: "Người dùng" },
  { href: "/admin/authors", label: "Tác giả" },
  { href: "/admin/categories", label: "Thể loại" },
  { href: "/admin/comics", label: "Truyện tranh" },
  { href: "/admin/chapters", label: "Chương truyện" },
  { href: "/admin/comments", label: "Bình luận" },
  { href: "/admin/comment-reports", label: "Báo cáo bình luận" },
  { href: "/admin/announcements", label: "Thông báo hệ thống" },
  { href: "/admin/coin-packages", label: "Gói coin" },
  { href: "/admin/contact-tickets", label: "Yêu cầu hỗ trợ" },
  { href: "/admin/audit-logs", label: "Nhật ký quản trị" },
  { href: "/admin/system-settings", label: "Cấu hình hệ thống" },
] as const;

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-lg border bg-card p-3 md:sticky md:top-24">
      <div className="mb-3 px-2">
        <p className="text-sm font-semibold">Admin</p>
        <p className="text-xs text-muted-foreground">Quản lý nội dung</p>
      </div>
      <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        {links.map((link) => {
          const isActive = isActiveLink(pathname, link.href);

          return (
            <AdminLink
              key={link.href}
              href={link.href}
              className={
                isActive
                  ? "whitespace-nowrap rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                  : "whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            >
              {link.label}
            </AdminLink>
          );
        })}
      </nav>
    </aside>
  );
}
