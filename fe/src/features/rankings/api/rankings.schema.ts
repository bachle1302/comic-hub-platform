import { z } from "zod";
import { paginationMetaSchema } from "@/shared/api/api-response.schema";
import {
  authorSchema,
  comicCategorySchema,
  comicStatusSchema,
  chapterSummarySchema,
} from "@/features/comics/api/comics.schema";

export const rankingTypeSchema = z.enum([
  "hot",
  "views",
  "likes",
  "follows",
  "latest",
]);

export const rankingPeriodSchema = z.enum(["all", "day", "week", "month"]);

export const rankingQuerySchema = z.object({
  type: rankingTypeSchema.optional(),
  period: rankingPeriodSchema.optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export const rankingComicSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  thumbnail: z.string().nullable().optional(),
  status: comicStatusSchema,
  viewTotal: z.number().optional().default(0),
  likeCount: z.number().optional().default(0),
  followCount: z.number().optional().default(0),
  chapterCount: z.number().optional().default(0),
  lastChapterAt: z.string().nullable().optional(),
  author: authorSchema.nullable().optional(),
  categories: z.array(comicCategorySchema).optional(),
  chapters: z.array(chapterSummarySchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const rankingsPaginatedSchema = z.object({
  items: z.array(rankingComicSchema),
  meta: paginationMetaSchema,
});

export type RankingType = z.infer<typeof rankingTypeSchema>;
export type RankingPeriod = z.infer<typeof rankingPeriodSchema>;
export type RankingQuery = z.infer<typeof rankingQuerySchema>;
export type RankingComic = z.infer<typeof rankingComicSchema>;
export type RankingsPaginated = z.infer<typeof rankingsPaginatedSchema>;
