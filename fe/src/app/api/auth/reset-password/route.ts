import { type NextRequest } from "next/server";
import { resetPasswordResultSchema } from "@/features/auth/api/auth.schema";
import {
  backendErrorResponse,
  errorResponse,
  getBackendAuthUrl,
  parseBackendSuccess,
  readJson,
  successResponse,
} from "../_shared/auth-route";

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const body = (await request.json()) as unknown;
  const backendResponse = await fetch(getBackendAuthUrl("/auth/reset-password"), {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJson(backendResponse);

  if (!backendResponse.ok) {
    return backendErrorResponse(payload, backendResponse.status, path);
  }

  try {
    return successResponse(
      parseBackendSuccess(payload, resetPasswordResultSchema),
      "Password reset successful",
      200,
      path,
    );
  } catch (error) {
    return errorResponse(
      "Invalid reset password response",
      502,
      path,
      "Bad Gateway",
      error instanceof Error ? error.message : undefined,
    );
  }
}
