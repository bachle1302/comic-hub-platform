"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePublicSettings } from "@/features/system-settings/model/PublicSettingsProvider";

const DEFAULT_SITE_NAME = "Comic Hub";
const DEFAULT_SITE_DESCRIPTION =
  "Đọc truyện tranh online, cập nhật nhanh.";
const DEFAULT_SUPPORT_EMAIL = "support@example.com";

export function SiteFooter() {
  const pathname = usePathname();
  const { settings } = usePublicSettings();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const siteName = settings.general?.siteName ?? DEFAULT_SITE_NAME;
  const siteDescription =
    settings.general?.siteDescription ?? DEFAULT_SITE_DESCRIPTION;
  const supportEmail = settings.general?.supportEmail ?? DEFAULT_SUPPORT_EMAIL;
  const socialLinks = [
    {
      href: settings.social?.facebookUrl,
      label: "Facebook",
    },
    {
      href: settings.social?.discordUrl,
      label: "Discord",
    },
    {
      href: settings.social?.telegramUrl,
      label: "Telegram",
    },
  ].filter((link): link is { href: string; label: string } =>
    Boolean(link.href?.trim()),
  );

  return (
    <footer className="mt-auto border-t bg-zinc-100 dark:bg-zinc-900">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 text-sm text-muted-foreground md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3">
          <Link href="/" prefetch={false} className="flex items-center gap-2 cursor-pointer group shrink-0 w-fit">
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 100 100" 
              className="group-hover:rotate-90 transition-transform duration-500 ease-in-out drop-shadow-md shrink-0"
            >
              {/* Nền tròn Đỏ chuẩn */}
              <circle cx="50" cy="50" r="36" fill="#E53935" />
              
              {/* Lưỡi phi tiêu cong Đen (Base) */}
              <path d="M 50 2 Q 58 42 98 50 Q 58 58 50 98 Q 42 58 2 50 Q 42 42 50 2 Z" fill="#111111" />
              
              {/* Mảng màu Xám Than tạo khối 3D cắt vát cho phi tiêu */}
              <path d="M 50 2 Q 58 42 98 50 L 50 50 Z" fill="#1f2937" />
              <path d="M 50 98 Q 42 58 2 50 L 50 50 Z" fill="#1f2937" />
              
              {/* Tâm Sharingan Tối giản */}
              <circle cx="50" cy="50" r="12" fill="#E53935" />
              <circle cx="50" cy="50" r="5" fill="#111111" />
              <circle cx="50" cy="50" r="1.5" fill="#ffffff" />
            </svg>

            <span className="font-extrabold text-2xl tracking-tighter ml-0.5 flex items-center select-none">
              <span className="bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-700 dark:from-zinc-50 dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent font-black tracking-tight">
                Comic
              </span>
              <span className="relative ml-1 px-2 py-0.5 rounded bg-gradient-to-br from-[#E53935] to-orange-500 text-white text-xs font-black tracking-normal shadow-[0_0_12px_rgba(229,57,53,0.3)] group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
                HUB
              </span>
            </span>
          </Link>
          <p>{siteDescription}</p>
          <p>
            Hỗ trợ:{" "}
            <a href={`mailto:${supportEmail}`} className="hover:text-foreground">
              {supportEmail}
            </a>
          </p>
          {socialLinks.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <nav className="space-y-2" aria-label="Liên kết chính">
          <p className="font-medium text-foreground">Khám phá</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:gap-2">
            <Link href="/" className="hover:text-foreground">
              Trang chủ
            </Link>
            <Link href="/truyen" className="hover:text-foreground">
              Truyện
            </Link>
            <Link href="/tim-kiem" className="hover:text-foreground">
              Tìm kiếm
            </Link>
          </div>
        </nav>

        <nav className="space-y-2" aria-label="Chính sách">
          <p className="font-medium text-foreground">Chính sách</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:gap-2">
            <Link href="/dieu-khoan" className="hover:text-foreground">
              Điều khoản
            </Link>
            <Link href="/chinh-sach-bao-mat" className="hover:text-foreground">
              Chính sách bảo mật
            </Link>
            <Link
              href="/chinh-sach-thanh-toan"
              className="hover:text-foreground"
            >
              Thanh toán / hoàn tiền
            </Link>
            <Link href="/lien-he" className="hover:text-foreground">
              Liên hệ
            </Link>
          </div>
        </nav>
      </div>
    </footer>
  );
}
