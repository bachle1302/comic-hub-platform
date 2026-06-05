import Link from "next/link";
import { getPublicSystemSettingsSafe } from "@/features/system-settings";

export async function SiteFooter() {
  const settings = await getPublicSystemSettingsSafe();
  const siteName = settings.general?.siteName ?? "Comic Hub";
  const siteDescription =
    settings.general?.siteDescription ?? "Đọc truyện tranh online, cập nhật nhanh.";
  const supportEmail = settings.general?.supportEmail ?? "support@example.com";
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
    <footer className="mt-auto border-t bg-muted/20">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 text-sm text-muted-foreground md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-2">
          <p className="font-medium text-foreground">{siteName}</p>
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

