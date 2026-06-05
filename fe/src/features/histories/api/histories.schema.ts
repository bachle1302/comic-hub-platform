import { z } from "zod";
import { comicStatusSchema } from "@/features/comics/api/comics.schema";

export const upsertHistoryInputSchema = z.object({
  comicId: z.number(),
  chapterId: z.number(),
  imageIndex: z.number().int().min(0).optional(),
  progress: z.number().min(0).max(1).optional(),
});

export const historyItemSchema = z.object({
  id: z.number(),
  imageIndex: z.number(),
  progress: z.number(),
  updatedAt: z.string(),
  comic: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    thumbnail: z.string().nullable().optional(),
    status: comicStatusSchema.optional(),
  }),
  chapter: z.object({
    id: z.number(),
    name: z.string(),
    chapterNumber: z.number(),
    price: z.number(),
  }),
});

export const historiesSchema = z.array(historyItemSchema);

export const comicHistoryResultSchema = z.object({
  history: historyItemSchema.nullable(),
});

export const deleteHistoryResultSchema = z.object({
  message: z.string(),
});

export type UpsertHistoryInput = z.infer<typeof upsertHistoryInputSchema>;
export type HistoryItem = z.infer<typeof historyItemSchema>;
export type ComicHistoryResult = z.infer<typeof comicHistoryResultSchema>;
export type DeleteHistoryResult = z.infer<typeof deleteHistoryResultSchema>;
