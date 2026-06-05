function readPublicApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL;

  if (!value) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  return value.replace(/\/+$/, "");
}

function readSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
}

export const API_URL = readPublicApiBaseUrl();
export const SITE_URL = readSiteUrl();
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function getApiBaseUrl(): string {
  return API_URL;
}

export function getServerApiBaseUrl(): string {
  const value =
    typeof window === "undefined"
      ? (process.env.NEXT_SERVER_API_URL ?? process.env.NEXT_PUBLIC_API_URL)
      : process.env.NEXT_PUBLIC_API_URL;

  if (!value) {
    throw new Error("NEXT_SERVER_API_URL or NEXT_PUBLIC_API_URL is not configured");
  }

  return value.replace(/\/+$/, "");
}

export function getSiteUrl(): string {
  return SITE_URL;
}

export function getGoogleClientId(): string {
  return GOOGLE_CLIENT_ID;
}
