import type { Metadata } from "next";
import { SITE_URL } from "@/shared/config/env";

export const DEFAULT_SITE_NAME = "Comic Hub";
export const DEFAULT_TITLE = "Đọc truyện tranh online";
export const DEFAULT_DESCRIPTION =
  "Đọc truyện tranh online, cập nhật nhanh, hỗ trợ truyện miễn phí và truyện trả phí.";

export function absoluteUrl(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${SITE_URL}${normalizedPath}`;
}

export function createOpenGraphImages(
  image?: string | null,
): NonNullable<Metadata["openGraph"]>["images"] | undefined {
  if (!image) {
    return undefined;
  }

  return [
    {
      url: image,
    },
  ];
}

export function createPageTitle(title: string): string {
  return `${title} - Đọc truyện tranh online`;
}
