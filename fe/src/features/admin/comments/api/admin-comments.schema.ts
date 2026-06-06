import { z } from "zod";

export const adminCommentUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().optional(),
  avatar: z.string().nullable().optional(),
});

export const adminCommentComicSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const adminCommentChapterSchema = z.object({
  id: z.number(),
  name: z.string(),
  chapterNumber: z.number(),
});

export const adminCommentSchema = z.object({
  id: z.number(),
  content: z.string(),
  userId: z.number().optional(),
  comicId: z.number().nullable().optional(),
  chapterId: z.number().nullable().optional(),
  parentId: z.number().nullable().optional(),
  deletedAt: z.string().nullable().optional(),
  deletedById: z.number().nullable().optional(),
  deleteReason: z.string().nullable().optional(),
  isDeleted: z.boolean().optional().default(false),
  likeCount: z.number().optional(),
  reportCount: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: adminCommentUserSchema.optional(),
  comic: adminCommentComicSchema.nullable().optional(),
  chapter: adminCommentChapterSchema.nullable().optional(),
});

export const adminCommentsMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export const adminCommentsPaginatedSchema = z.object({
  items: z.array(adminCommentSchema),
  meta: adminCommentsMetaSchema,
});

export const adminCommentsQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  comicId: z.number().optional(),
  chapterId: z.number().optional(),
  deleted: z.enum(["active", "deleted", "all"]).optional(),
});

export const deleteAdminCommentResultSchema = z.object({
  message: z.string().optional().default("Comment deleted successfully"),
  comment: z
    .object({
      id: z.number().optional(),
      deletedAt: z.string().nullable().optional(),
      deletedById: z.number().nullable().optional(),
      deleteReason: z.string().nullable().optional(),
      isDeleted: z.boolean().optional().default(true),
    })
    .optional(),
});

export type AdminComment = z.infer<typeof adminCommentSchema>;
export type AdminCommentsPaginated = z.infer<
  typeof adminCommentsPaginatedSchema
>;
export type AdminCommentsQuery = z.infer<typeof adminCommentsQuerySchema>;
export type DeleteAdminCommentResult = z.infer<
  typeof deleteAdminCommentResultSchema
>;
