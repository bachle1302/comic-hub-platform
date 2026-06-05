import { type NextRequest } from "next/server";
import { verifyEmailResultSchema } from "@/features/auth/api/auth.schema";
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
  const backendResponse = await fetch(getBackendAuthUrl("/auth/verify-email"), {
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
      parseBackendSuccess(payload, verifyEmailResultSchema),
      "Email verified",
      200,
      path,
    );
  } catch (error) {
    return errorResponse(
      "Invalid verify email response",
      502,
      path,
      "Bad Gateway",
      error instanceof Error ? error.message : undefined,
    );
  }
}
