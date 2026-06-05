import { NextResponse } from "next/server";
import { z } from "zod";
import {
  apiErrorResponseSchema,
  apiSuccessResponseSchema,
} from "@/shared/api/api-response.schema";
import { authSessionCookieName } from "@/shared/auth/session-marker";
import { getServerApiBaseUrl } from "@/shared/config/env";

export const refreshTokenCookieName = "refreshToken";

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};

export const authSessionCookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};

export { authSessionCookieName };

export function getBackendAuthUrl(path: string): string {
  return `${getServerApiBaseUrl()}${path}`;
}

export async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

export function successResponse<TData>(
  data: TData,
  message: string,
  statusCode: number,
  path: string,
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
      path,
    },
    { status: statusCode },
  );
}

export function errorResponse(
  message: string,
  statusCode: number,
  path: string,
  error = message,
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path,
      ...(details === undefined ? {} : { details }),
    },
    { status: statusCode },
  );
}

export function backendErrorResponse(
  payload: unknown,
  fallbackStatus: number,
  path: string,
): NextResponse {
  const parsed = apiErrorResponseSchema.safeParse(payload);

  if (!parsed.success) {
    return errorResponse("Request failed", fallbackStatus, path);
  }

  return errorResponse(
    parsed.data.message,
    parsed.data.statusCode,
    path,
    parsed.data.error,
    parsed.data.details,
  );
}

export function parseBackendSuccess<TSchema extends z.ZodTypeAny>(
  payload: unknown,
  schema: TSchema,
): z.infer<TSchema> {
  const parsed = apiSuccessResponseSchema(schema).safeParse(payload);

  if (!parsed.success) {
    throw new Error("Invalid backend response shape");
  }

  const successPayload = parsed.data as { data: z.infer<TSchema> };

  return successPayload.data;
}
