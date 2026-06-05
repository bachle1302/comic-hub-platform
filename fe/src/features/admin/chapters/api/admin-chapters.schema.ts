import { z } from "zod";

export const chapterImageSchema = z.object({
  id: z.number().optional(),
  url: z.string(),
  key: z.string().nullable().optional(),
  order: z.number(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  size: z.number().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  chapterId: z.number().optional(),
});

export const chapterImageInputSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  key: z.string().optional(),
  order: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  size: z.number().optional(),
  mimeType: z.string().optional(),
});

export const adminChapterSchema = z.object({
  id: z.number(),
  name: z.string(),
  chapterNumber: z.number(),
  price: z.number(),
  isPublic: z.boolean(),
  deletedAt: z.string().nullable().optional(),
  deletedById: z.number().nullable().optional(),
  deleteReason: z.string().nullable().optional(),
  isDeleted: z.boolean().optional().default(false),
  viewTotal: z.number(),
  comicId: z.number().optional(),
  comic: z
    .object({
      id: z.number(),
      name: z.string(),
      slug: z.string(),
      thumbnail: z.string().nullable().optional(),
    })
    .optional(),
  images: z.array(chapterImageSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _count: z
    .object({
      images: z.number().optional(),
      comments: z.number().optional(),
      purchases: z.number().optional(),
    })
    .optional(),
});

export const adminChapterListSchema = z.array(adminChapterSchema);

export const adminChaptersQuerySchema = z.object({
  deleted: z.enum(["active", "deleted", "all"]).optional(),
});

export const createAdminChapterInputSchema = z.object({
  name: z.string().min(1, "Vui long nhap ten chapter"),
  chapterNumber: z.number().min(0, "Chapter number khong hop le"),
  price: z.number().min(0, "Gia khong duoc am").optional(),
  isPublic: z.boolean().optional(),
  images: z.array(chapterImageInputSchema).optional(),
});

export const updateAdminChapterInputSchema =
  createAdminChapterInputSchema.partial();

export const deleteAdminChapterResultSchema = z.object({
  message: z.string().optional().default("Chapter deleted successfully"),
  chapter: z
    .object({
      id: z.number(),
      comicId: z.number(),
      chapterNumber: z.number(),
      comicSlug: z.string(),
    })
    .optional(),
});

export type ChapterImage = z.infer<typeof chapterImageSchema>;
export type ChapterImageInput = z.infer<typeof chapterImageInputSchema>;
export type AdminChapter = z.infer<typeof adminChapterSchema>;
export type AdminChaptersQuery = z.infer<typeof adminChaptersQuerySchema>;
export type CreateAdminChapterInput = z.infer<
  typeof createAdminChapterInputSchema
>;
export type UpdateAdminChapterInput = z.infer<
  typeof updateAdminChapterInputSchema
>;
export type DeleteAdminChapterResult = z.infer<
  typeof deleteAdminChapterResultSchema
>;
