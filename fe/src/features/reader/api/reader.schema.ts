import { z } from "zod";
import {
  chapterImageSchema,
  chapterSummarySchema,
  comicSchema,
} from "@/features/comics/api/comics.schema";

export const chapterNavigationItemSchema = z.object({
  chapterNumber: z.number(),
  name: z.string(),
});

export const chapterReaderSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  chapterNumber: z.number().optional(),
  price: z.number().optional(),
  isPublic: z.boolean().optional(),
  viewTotal: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  comic: comicSchema.pick({
    id: true,
    name: true,
    slug: true,
    thumbnail: true,
  }),
  chapter: chapterSummarySchema.optional(),
  images: z.array(chapterImageSchema),
  navigation: z.object({
    previousChapter: chapterNavigationItemSchema.nullable(),
    nextChapter: chapterNavigationItemSchema.nullable(),
  }),
});

export type ChapterNavigationItem = z.infer<typeof chapterNavigationItemSchema>;
export type ChapterReader = z.infer<typeof chapterReaderSchema>;
