"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getPublicSystemSettingsClientSafe } from "@/features/system-settings/api/public-system-settings.client-api";
import type { PublicSystemSettings } from "@/features/system-settings/api/system-settings.schema";

const DEFAULT_SITE_NAME = "Comic Hub";
const DEFAULT_SITE_DESCRIPTION =
  "Doc truyen tranh online, cap nhat nhanh.";
const DEFAULT_SUPPORT_EMAIL = "support@example.com";

export function SiteFooter() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<PublicSystemSettings>({});

  useEffect(() => {
    let isMounted = true;

    if (pathname.startsWith("/admin")) {
      return undefined;
    }

    getPublicSystemSettingsClientSafe().then((nextSettings) => {
      if (isMounted) {
        setSettings(nextSettings);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [pathname]);

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
    <footer className="mt-auto border-t bg-muted/20">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 text-sm text-muted-foreground md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-2">
          <p className="font-medium text-foreground">{siteName}</p>
          <p>{siteDescription}</p>
          <p>
            Ho tro:{" "}
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

        <nav className="space-y-2" aria-label="Lien ket chinh">
          <p className="font-medium text-foreground">Kham pha</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:gap-2">
            <Link href="/" className="hover:text-foreground">
              Trang chu
            </Link>
            <Link href="/truyen" className="hover:text-foreground">
              Truyen
            </Link>
            <Link href="/tim-kiem" className="hover:text-foreground">
              Tim kiem
            </Link>
          </div>
        </nav>

        <nav className="space-y-2" aria-label="Chinh sach">
          <p className="font-medium text-foreground">Chinh sach</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:gap-2">
            <Link href="/dieu-khoan" className="hover:text-foreground">
              Dieu khoan
            </Link>
            <Link href="/chinh-sach-bao-mat" className="hover:text-foreground">
              Chinh sach bao mat
            </Link>
            <Link
              href="/chinh-sach-thanh-toan"
              className="hover:text-foreground"
            >
              Thanh toan / hoan tien
            </Link>
            <Link href="/lien-he" className="hover:text-foreground">
              Lien he
            </Link>
          </div>
        </nav>
      </div>
    </footer>
  );
}
