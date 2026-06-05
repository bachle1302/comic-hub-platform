import { z } from "zod";
import { paginatedDataSchema } from "@/shared/api/api-response.schema";
import {
  comicSchema,
  comicStatusSchema,
} from "@/features/comics/api/comics.schema";
import { comicSortSchema } from "@/features/search/api/search.schema";

export const authorComicsQuerySchema = z.object({
  status: comicStatusSchema.optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  sort: comicSortSchema.optional(),
});

export const authorComicsResultSchema = paginatedDataSchema(comicSchema);

export type AuthorComicsQuery = z.infer<typeof authorComicsQuerySchema>;
export type AuthorComicsResult = z.infer<typeof authorComicsResultSchema>;
