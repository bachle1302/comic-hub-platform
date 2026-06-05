import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import { refreshResultSchema } from "@/features/auth/api/auth.schema";
import {
  backendErrorResponse,
  errorResponse,
  getBackendAuthUrl,
  parseBackendSuccess,
  readJson,
  refreshTokenCookieName,
  successResponse,
} from "../_shared/auth-route";

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(refreshTokenCookieName)?.value;

  if (!refreshToken) {
    return errorResponse("Unauthorized", 401, path, "Unauthorized");
  }

  const backendResponse = await fetch(getBackendAuthUrl("/auth/refresh"), {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });
  const payload = await readJson(backendResponse);

  if (!backendResponse.ok) {
    return backendErrorResponse(payload, backendResponse.status, path);
  }

  try {
    const data = parseBackendSuccess(payload, refreshResultSchema);

    return successResponse(
      data,
      "Token refreshed successfully",
      200,
      path,
    );
  } catch (error) {
    return errorResponse(
      "Invalid refresh response",
      502,
      path,
      "Bad Gateway",
      error instanceof Error ? error.message : undefined,
    );
  }
}
