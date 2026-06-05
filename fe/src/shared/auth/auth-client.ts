import { z } from "zod";
import {
  apiErrorResponseSchema,
  apiSuccessResponseSchema,
} from "@/shared/api/api-response.schema";
import { clearAccessToken, setAccessToken } from "./token-storage";

const refreshDataSchema = z.object({
  user: z.unknown().optional(),
  accessToken: z.string(),
});

function getErrorMessage(payload: unknown): string {
  const parsed = apiErrorResponseSchema.safeParse(payload);
  return parsed.success ? parsed.data.message : "Could not refresh token";
}

export async function refreshAccessToken(): Promise<string> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    cache: "no-store",
    credentials: "include",
  });
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    clearAccessToken();
    throw new Error(getErrorMessage(payload));
  }

  const parsed = apiSuccessResponseSchema(refreshDataSchema).safeParse(payload);

  if (!parsed.success) {
    clearAccessToken();
    throw new Error("Invalid refresh response shape");
  }

  const successPayload = parsed.data as { data: z.infer<typeof refreshDataSchema> };
  setAccessToken(successPayload.data.accessToken);

  return successPayload.data.accessToken;
}

export function logoutClientSide(): void {
  clearAccessToken();
}

