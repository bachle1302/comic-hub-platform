import { z } from "zod";
import {
  apiErrorResponseSchema,
  parseApiSuccessData,
} from "./api-response.schema";
import { getApiBaseUrl } from "@/shared/config/env";
import { clearAccessToken, getAccessToken } from "@/shared/auth/token-storage";

type ClientApiOptions = {
  auth?: boolean;
  headers?: Record<string, string>;
};

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

const inFlightGetRequests = new Map<string, Promise<unknown>>();

function getErrorMessage(payload: unknown): string {
  const parsed = apiErrorResponseSchema.safeParse(payload);
  return parsed.success ? parsed.data.message : "Request failed";
}

function resolveUrl(path: string): string {
  return path.startsWith("/api/") ? path : `${getApiBaseUrl()}${path}`;
}

function createGetRequestKey(path: string, options?: ClientApiOptions): string {
  const authPart = options?.auth ? "auth" : "public";
  const headersPart = JSON.stringify(options?.headers ?? {});

  return `${authPart}:${resolveUrl(path)}:${headersPart}`;
}

async function request<TSchema extends z.ZodTypeAny>(
  method: HttpMethod,
  path: string,
  schema: TSchema,
  body?: unknown,
  options?: ClientApiOptions,
  retryOnUnauthorized = true,
): Promise<z.infer<TSchema>> {
  const headers: Record<string, string> = {
    ...(options?.headers ?? {}),
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options?.auth) {
    let accessToken = getAccessToken();

    if (!accessToken && retryOnUnauthorized) {
      try {
        const { refreshAccessToken } = await import("@/shared/auth/auth-client");
        accessToken = await refreshAccessToken();
      } catch (error) {
        clearAccessToken();
        throw error instanceof Error ? error : new Error("Unauthorized");
      }
    }

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(resolveUrl(path), {
    method,
    cache: "no-store",
    credentials: path.startsWith("/api/") ? "include" : "same-origin",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = (await response.json()) as unknown;

  if (response.status === 401 && options?.auth && retryOnUnauthorized) {
    try {
      const { refreshAccessToken } = await import("@/shared/auth/auth-client");
      await refreshAccessToken();
      return request(method, path, schema, body, options, false);
    } catch (error) {
      clearAccessToken();
      throw error instanceof Error ? error : new Error("Unauthorized");
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload));
  }

  return parseApiSuccessData(payload, schema);
}

function dedupeGet<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema,
  options?: ClientApiOptions,
): Promise<z.infer<TSchema>> {
  const key = createGetRequestKey(path, options);
  const existingRequest = inFlightGetRequests.get(key);

  if (existingRequest) {
    return existingRequest as Promise<z.infer<TSchema>>;
  }

  const nextRequest = request("GET", path, schema, undefined, options).finally(
    () => {
      inFlightGetRequests.delete(key);
    },
  );

  inFlightGetRequests.set(key, nextRequest);

  return nextRequest;
}

export function clientApiGet<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema,
  options?: ClientApiOptions,
): Promise<z.infer<TSchema>> {
  return dedupeGet(path, schema, options);
}

export function clientApiPost<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema,
  body?: unknown,
  options?: ClientApiOptions,
): Promise<z.infer<TSchema>> {
  return request("POST", path, schema, body, options);
}

export function clientApiPatch<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema,
  body?: unknown,
  options?: ClientApiOptions,
): Promise<z.infer<TSchema>> {
  return request("PATCH", path, schema, body, options);
}

export function clientApiDelete<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema,
  options?: ClientApiOptions,
): Promise<z.infer<TSchema>> {
  return request("DELETE", path, schema, undefined, options);
}
