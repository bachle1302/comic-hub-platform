import { z } from "zod";
import { paginatedDataSchema } from "@/shared/api/api-response.schema";
import {
  comicSchema,
  comicStatusSchema,
} from "@/features/comics/api/comics.schema";

export const comicSortSchema = z.enum(["latest", "hot", "newest", "name"]);

export const searchComicsQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  status: comicStatusSchema.optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  sort: comicSortSchema.optional(),
});

export const searchComicsResultSchema = paginatedDataSchema(comicSchema);

export type ComicSort = z.infer<typeof comicSortSchema>;
export type SearchComicsQuery = z.infer<typeof searchComicsQuerySchema>;
export type SearchComicsResult = z.infer<typeof searchComicsResultSchema>;

export const searchSuggestionSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(),
  slug: z.string(),
  thumbnail: z.string().nullable().optional(),
  authorName: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  latestChapterNumber: z.number().nullable().optional(),
});

export const searchSuggestionsSchema = z.array(searchSuggestionSchema);

export type SearchSuggestion = z.infer<typeof searchSuggestionSchema>;

