import { z } from "zod";
import {
  apiErrorResponseSchema,
  parseApiSuccessData,
} from "./api-response.schema";
import { getServerApiBaseUrl } from "@/shared/config/env";

type QueryValue = string | number | boolean | undefined | null;

type ServerApiGetOptions = {
  revalidate?: number;
  tags?: string[];
  query?: Record<string, QueryValue>;
};

function buildQueryString(query?: Record<string, QueryValue>): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

function getErrorMessage(payload: unknown): string {
  const parsed = apiErrorResponseSchema.safeParse(payload);
  return parsed.success ? parsed.data.message : "Request failed";
}

export async function serverApiGet<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema,
  options?: ServerApiGetOptions,
): Promise<z.infer<TSchema>> {
  const response = await fetch(
    `${getServerApiBaseUrl()}${path}${buildQueryString(options?.query)}`,
    {
      next: {
        revalidate: options?.revalidate ?? 60,
        tags: options?.tags,
      },
    },
  );
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error(getErrorMessage(payload));
  }

  return parseApiSuccessData(payload, schema);
}
