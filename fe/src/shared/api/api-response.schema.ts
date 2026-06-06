import { z } from "zod";

export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  statusCode: z.number(),
  message: z.string(),
  error: z.string(),
  timestamp: z.string(),
  path: z.string(),
  details: z.unknown().optional(),
});

export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export function apiSuccessResponseSchema<TSchema extends z.ZodTypeAny>(
  dataSchema: TSchema,
) {
  return z.object({
    success: z.literal(true),
    statusCode: z.number(),
    message: z.string(),
    data: dataSchema,
    timestamp: z.string(),
    path: z.string(),
  });
}

export function parseApiSuccessData<TSchema extends z.ZodTypeAny>(
  payload: unknown,
  schema: TSchema,
): z.infer<TSchema> {
  const envelopeParsed = apiSuccessResponseSchema(z.unknown()).safeParse(payload);

  if (!envelopeParsed.success) {
    throw new Error("Invalid API response shape");
  }

  const dataParsed = schema.safeParse(envelopeParsed.data.data);

  if (dataParsed.success) {
    return dataParsed.data;
  }

  const messageFallbackParsed = schema.safeParse({
    message: envelopeParsed.data.message,
  });

  if (messageFallbackParsed.success) {
    return messageFallbackParsed.data;
  }

  throw new Error("Invalid API response shape");
}

export function paginatedDataSchema<TSchema extends z.ZodTypeAny>(
  itemSchema: TSchema,
) {
  return z.object({
    items: z.array(itemSchema),
    meta: paginationMetaSchema,
  });
}

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
