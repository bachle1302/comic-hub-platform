import { z } from "zod";

export const comicStatusSchema = z.enum([
  "ONGOING",
  "COMPLETED",
  "HIATUS",
  "CANCELLED",
]);

export const adminComicAuthorSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const adminComicCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const adminComicCategoryRelationSchema = z.object({
  category: adminComicCategorySchema,
});

export const adminComicChapterSummarySchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  chapterNumber: z.number().optional(),
  price: z.number().optional(),
  isPublic: z.boolean().optional(),
  deletedAt: z.string().nullable().optional(),
  deletedById: z.number().nullable().optional(),
  deleteReason: z.string().nullable().optional(),
  isDeleted: z.boolean().optional().default(false),
  createdAt: z.string().optional(),
});

export const adminComicSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  status: comicStatusSchema,
  isPublic: z.boolean(),
  deletedAt: z.string().nullable().optional(),
  deletedById: z.number().nullable().optional(),
  deleteReason: z.string().nullable().optional(),
  isDeleted: z.boolean().optional().default(false),
  viewTotal: z.number(),
  followCount: z.number().optional(),
  chapterCount: z.number().optional(),
  lastChapterAt: z.string().nullable().optional(),
  authorId: z.number().optional(),
  author: adminComicAuthorSchema.optional(),
  categories: z.array(adminComicCategoryRelationSchema).optional(),
  chapters: z.array(adminComicChapterSummarySchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _count: z
    .object({
      chapters: z.number().optional(),
      follows: z.number().optional(),
      comments: z.number().optional(),
    })
    .optional(),
});

export const adminComicListSchema = z.array(adminComicSchema);

export const adminComicsQuerySchema = z.object({
  deleted: z.enum(["active", "deleted", "all"]).optional(),
});

const optionalTextSchema = z.string().optional();

export const createAdminComicInputSchema = z.object({
  name: z.string().min(1, "Vui long nhap ten truyen"),
  slug: z.string().min(1, "Vui long nhap slug"),
  description: optionalTextSchema,
  seoTitle: optionalTextSchema,
  seoDescription: optionalTextSchema,
  thumbnail: optionalTextSchema,
  status: comicStatusSchema,
  isPublic: z.boolean(),
  authorId: z.number().min(1, "Vui long chon tac gia"),
  categoryIds: z.array(z.number()).optional(),
});

export const updateAdminComicInputSchema =
  createAdminComicInputSchema.partial();

export const deleteAdminComicResultSchema = z.object({
  message: z.string().optional().default("Comic deleted successfully"),
  comic: z
    .object({
      id: z.number(),
      slug: z.string(),
    })
    .optional(),
});

export type ComicStatus = z.infer<typeof comicStatusSchema>;
export type AdminComic = z.infer<typeof adminComicSchema>;
export type AdminComicsQuery = z.infer<typeof adminComicsQuerySchema>;
export type CreateAdminComicInput = z.infer<typeof createAdminComicInputSchema>;
export type UpdateAdminComicInput = z.infer<typeof updateAdminComicInputSchema>;
export type DeleteAdminComicResult = z.infer<
  typeof deleteAdminComicResultSchema
>;
