import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import { backendGoogleLoginResultSchema } from "@/features/auth/api/auth.schema";
import {
  authSessionCookieName,
  authSessionCookieOptions,
  backendErrorResponse,
  errorResponse,
  getBackendAuthUrl,
  parseBackendSuccess,
  readJson,
  refreshTokenCookieName,
  refreshTokenCookieOptions,
  successResponse,
} from "../_shared/auth-route";

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const body = (await request.json()) as unknown;

  const backendResponse = await fetch(getBackendAuthUrl("/auth/google"), {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await readJson(backendResponse);

  if (!backendResponse.ok) {
    return backendErrorResponse(payload, backendResponse.status, path);
  }

  try {
    const data = parseBackendSuccess(payload, backendGoogleLoginResultSchema);
    const cookieStore = await cookies();

    cookieStore.set(
      refreshTokenCookieName,
      data.refreshToken,
      refreshTokenCookieOptions,
    );
    cookieStore.set(authSessionCookieName, "1", authSessionCookieOptions);

    return successResponse(
      {
        user: data.user,
        accessToken: data.accessToken,
      },
      "Google login successful",
      200,
      path,
    );
  } catch (error) {
    return errorResponse(
      "Invalid Google login response",
      502,
      path,
      "Bad Gateway",
      error instanceof Error ? error.message : undefined,
    );
  }
}
