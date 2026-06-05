import { z } from "zod";

export const roleSchema = z.enum(["USER", "ADMIN"]);

export const comicStatusSchema = z.enum([
  "ONGOING",
  "COMPLETED",
  "HIATUS",
  "CANCELLED",
]);

export const authorSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  _count: z
    .object({
      comics: z.number(),
    })
    .optional(),
});

export const comicCategorySchema = z.object({
  id: z.number().optional(),
  comicId: z.number().optional(),
  categoryId: z.number().optional(),
  category: categorySchema,
});

export const chapterSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  chapterNumber: z.number(),
  price: z.number(),
  isPublic: z.boolean(),
  viewTotal: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const chapterImageSchema = z.object({
  id: z.number().optional(),
  url: z.string(),
  key: z.string().nullable().optional(),
  order: z.number(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  size: z.number().nullable().optional(),
  mimeType: z.string().nullable().optional(),
});

export const comicCountSchema = z
  .object({
    likes: z.number().optional(),
    follows: z.number().optional(),
  })
  .optional();

export const comicSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  status: comicStatusSchema,
  isPublic: z.boolean(),
  viewTotal: z.number(),
  followCount: z.number().optional().default(0),
  likeCount: z.number().optional().default(0),
  chapterCount: z.number().optional(),
  lastChapterAt: z.string().nullable().optional(),
  author: authorSchema.nullable().optional(),
  categories: z.array(comicCategorySchema).optional(),
  chapters: z.array(chapterSummarySchema).optional(),
  _count: comicCountSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const comicDetailSchema = comicSchema.extend({
  chapters: z.array(chapterSummarySchema),
});

export const comicListSchema = z.array(comicSchema);

export const comicLikeStatusSchema = z.object({
  isLiked: z.boolean(),
  likeCount: z.number(),
});

export type Role = z.infer<typeof roleSchema>;
export type ComicStatus = z.infer<typeof comicStatusSchema>;
export type Author = z.infer<typeof authorSchema>;
export type Category = z.infer<typeof categorySchema>;
export type ComicCategory = z.infer<typeof comicCategorySchema>;
export type ChapterSummary = z.infer<typeof chapterSummarySchema>;
export type ChapterImage = z.infer<typeof chapterImageSchema>;
export type Comic = z.infer<typeof comicSchema>;
export type ComicDetail = z.infer<typeof comicDetailSchema>;
export type ComicLikeStatus = z.infer<typeof comicLikeStatusSchema>;
