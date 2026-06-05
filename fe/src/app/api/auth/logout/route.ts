import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import {
  authSessionCookieName,
  authSessionCookieOptions,
  getBackendAuthUrl,
  readJson,
  refreshTokenCookieName,
  refreshTokenCookieOptions,
  successResponse,
} from "../_shared/auth-route";

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(refreshTokenCookieName)?.value;

  if (refreshToken) {
    try {
      await fetch(getBackendAuthUrl("/auth/logout"), {
        method: "POST",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }).then(readJson);
    } catch {
      // Local session cleanup should still happen if the backend is unreachable.
    }
  }

  cookieStore.set(refreshTokenCookieName, "", {
    ...refreshTokenCookieOptions,
    maxAge: 0,
  });
  cookieStore.set(authSessionCookieName, "", {
    ...authSessionCookieOptions,
    maxAge: 0,
  });

  return successResponse({}, "Logout successful", 200, path);
}
