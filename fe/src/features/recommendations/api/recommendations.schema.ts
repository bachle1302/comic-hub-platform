import { z } from "zod";

// ---------------------------------------------------------------------------
// Category slim schema (reused inside recommendation items)
// ---------------------------------------------------------------------------
export const recommendationCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

// ---------------------------------------------------------------------------
// Single recommendation item
// Backend returns: id, title, slug, thumbnail, status, authorName,
// categories[], latestChapterNumber, viewTotal, followCount, likeCount,
// score, reasons[]
// ---------------------------------------------------------------------------
export const recommendationItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  thumbnail: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  authorName: z.string().nullable().optional(),
  categories: z.array(recommendationCategorySchema).default([]),
  latestChapterNumber: z.number().nullable().optional(),
  viewTotal: z.number().optional().default(0),
  followCount: z.number().optional().default(0),
  likeCount: z.number().optional().default(0),
  score: z.number().optional(),
  reasons: z.array(z.string()).default([]),
});

// ---------------------------------------------------------------------------
// Result shape returned by every recommendations endpoint
// { items: [...], meta: { total, limit } }
// ---------------------------------------------------------------------------
export const recommendationsMetaSchema = z.object({
  total: z.number(),
  limit: z.number(),
});

export const recommendationsResultSchema = z.object({
  items: z.array(recommendationItemSchema),
  meta: recommendationsMetaSchema,
});

// ---------------------------------------------------------------------------
// Derived types — Zod-first, no manual duplicates
// ---------------------------------------------------------------------------
export type RecommendationCategory = z.infer<
  typeof recommendationCategorySchema
>;
export type RecommendationItem = z.infer<typeof recommendationItemSchema>;
export type RecommendationsResult = z.infer<
  typeof recommendationsResultSchema
>;
