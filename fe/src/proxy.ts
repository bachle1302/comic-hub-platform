import { NextRequest, NextResponse } from "next/server";

const FALLBACK_API_URL = "http://localhost:4000";

const BYPASS_PREFIXES = [
  "/admin",
  "/api",
  "/login",
  "/maintenance",
  "/_next",
];

const BYPASS_PATHS = ["/favicon.ico", "/robots.txt", "/sitemap.xml"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBypassPath(pathname: string): boolean {
  return (
    BYPASS_PATHS.includes(pathname) ||
    BYPASS_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

function readMaintenanceMode(payload: unknown): boolean {
  if (!isRecord(payload)) {
    return false;
  }

  const data = isRecord(payload.data) ? payload.data : payload;
  const system = isRecord(data.system) ? data.system : null;

  return system?.maintenanceMode === true;
}

function getApiBaseUrl(): string {
  return (
    process.env.NEXT_SERVER_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    FALLBACK_API_URL
  ).replace(/\/+$/, "");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isBypassPath(pathname)) {
    return NextResponse.next();
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/system-settings/public`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.next();
    }

    const payload: unknown = await response.json();

    if (readMaintenanceMode(payload)) {
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      url.search = "";
      return NextResponse.rewrite(url);
    }
  } catch {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
