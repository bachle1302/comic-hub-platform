import { z } from "zod";
import { paginatedDataSchema } from "@/shared/api/api-response.schema";
import {
  categorySchema,
  comicSchema,
  comicStatusSchema,
} from "@/features/comics/api/comics.schema";
import { comicSortSchema } from "@/features/search/api/search.schema";

export const categoryListItemSchema = categorySchema;

export const categoriesSchema = z.object({
  categories: z.array(categoryListItemSchema),
});

export const categoryComicsQuerySchema = z.object({
  status: comicStatusSchema.optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  sort: comicSortSchema.optional(),
});

export const categoryComicsResultSchema = paginatedDataSchema(comicSchema);

export type CategoryListItem = z.infer<typeof categoryListItemSchema>;
export type CategoriesData = z.infer<typeof categoriesSchema>;
export type CategoryComicsQuery = z.infer<typeof categoryComicsQuerySchema>;
export type CategoryComicsResult = z.infer<typeof categoryComicsResultSchema>;
