import { z } from "zod";
import {
  apiErrorResponseSchema,
  parseApiSuccessData,
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

let refreshTokenInFlight: Promise<string> | null = null;

async function requestRefreshAccessToken(): Promise<string> {
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

  try {
    const data = parseApiSuccessData(payload, refreshDataSchema);
    setAccessToken(data.accessToken);

    return data.accessToken;
  } catch {
    clearAccessToken();
    throw new Error("Invalid refresh response shape");
  }
}

export function refreshAccessToken(): Promise<string> {
  if (!refreshTokenInFlight) {
    refreshTokenInFlight = requestRefreshAccessToken().finally(() => {
      refreshTokenInFlight = null;
    });
  }

  return refreshTokenInFlight;
}

export function logoutClientSide(): void {
  clearAccessToken();
}
