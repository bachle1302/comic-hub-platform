import { type NextRequest } from "next/server";
import { forgotPasswordResultSchema } from "@/features/auth/api/auth.schema";
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
  const backendResponse = await fetch(getBackendAuthUrl("/auth/forgot-password"), {
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
      parseBackendSuccess(payload, forgotPasswordResultSchema),
      "Password reset email sent",
      200,
      path,
    );
  } catch (error) {
    return errorResponse(
      "Invalid forgot password response",
      502,
      path,
      "Bad Gateway",
      error instanceof Error ? error.message : undefined,
    );
  }
}
