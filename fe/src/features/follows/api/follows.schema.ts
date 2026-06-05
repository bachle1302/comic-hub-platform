import { z } from "zod";
import {
  authorSchema,
  chapterSummarySchema,
  comicCategorySchema,
  comicStatusSchema,
} from "@/features/comics/api/comics.schema";

export const followStatusSchema = z.object({
  isFollowing: z.boolean(),
});

export const followComicResultSchema = z.object({
  isFollowing: z.boolean(),
  follow: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const unfollowComicResultSchema = z.object({
  isFollowing: z.boolean(),
});

export const followedComicSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  comic: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    thumbnail: z.string().nullable().optional(),
    status: comicStatusSchema,
    viewTotal: z.number().optional(),
    followCount: z.number().optional(),
    chapterCount: z.number().optional(),
    lastChapterAt: z.string().nullable().optional(),
    author: authorSchema.nullable().optional(),
    categories: z.array(comicCategorySchema).optional(),
    chapters: z.array(chapterSummarySchema).optional(),
  }),
});

export const followedComicsSchema = z.array(followedComicSchema);

export type FollowStatus = z.infer<typeof followStatusSchema>;
export type FollowComicResult = z.infer<typeof followComicResultSchema>;
export type UnfollowComicResult = z.infer<typeof unfollowComicResultSchema>;
export type FollowedComic = z.infer<typeof followedComicSchema>;
