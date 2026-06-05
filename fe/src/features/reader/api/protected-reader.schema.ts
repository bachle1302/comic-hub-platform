import { z } from "zod";
import { chapterImageSchema } from "@/features/comics/api/comics.schema";
import { chapterNavigationItemSchema } from "./reader.schema";

export const protectedReaderAccessSchema = z.object({
  hasAccess: z.boolean(),
  isFree: z.boolean(),
  isPurchased: z.boolean(),
  price: z.number(),
});

export const protectedReaderSchema = z.object({
  comic: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    thumbnail: z.string().nullable().optional(),
  }),
  chapter: z.object({
    id: z.number(),
    name: z.string(),
    chapterNumber: z.number(),
    price: z.number(),
    isPublic: z.boolean(),
    viewTotal: z.number(),
  }),
  images: z.array(chapterImageSchema),
  navigation: z.object({
    previousChapter: chapterNavigationItemSchema.nullable(),
    nextChapter: chapterNavigationItemSchema.nullable(),
  }),
  access: protectedReaderAccessSchema,
});

export type ProtectedReaderAccess = z.infer<
  typeof protectedReaderAccessSchema
>;
export type ProtectedReader = z.infer<typeof protectedReaderSchema>;
