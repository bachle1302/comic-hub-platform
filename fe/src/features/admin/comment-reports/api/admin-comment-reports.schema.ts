import { z } from "zod";
import { paginationMetaSchema } from "@/shared/api/api-response.schema";

export const commentReportStatusSchema = z.enum([
  "PENDING",
  "RESOLVED",
  "REJECTED",
]);

export const adminReportUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().optional(),
  avatar: z.string().nullable().optional(),
});

export const adminReportedCommentUserSchema = adminReportUserSchema;

export const adminReportedComicSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const adminReportedChapterSchema = z.object({
  id: z.number(),
  name: z.string(),
  chapterNumber: z.number(),
});

export const adminReportedCommentSchema = z.object({
  id: z.number(),
  content: z.string(),
  userId: z.number(),
  comicId: z.number().nullable().optional(),
  chapterId: z.number().nullable().optional(),
  parentId: z.number().nullable().optional(),
  deletedAt: z.string().nullable().optional(),
  deletedById: z.number().nullable().optional(),
  deleteReason: z.string().nullable().optional(),
  isDeleted: z.boolean().optional().default(false),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  user: adminReportedCommentUserSchema.optional(),
  comic: adminReportedComicSchema.nullable().optional(),
  chapter: adminReportedChapterSchema.nullable().optional(),
});

export const adminCommentReportSchema = z.object({
  id: z.number(),
  commentId: z.number(),
  userId: z.number(),
  reason: z.string(),
  status: commentReportStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  user: adminReportUserSchema.optional(),
  comment: adminReportedCommentSchema.optional(),
});

export const adminCommentReportsPaginatedSchema = z.object({
  items: z.array(adminCommentReportSchema),
  meta: paginationMetaSchema,
});

export const adminCommentReportsQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  status: commentReportStatusSchema.optional(),
  commentId: z.number().optional(),
  userId: z.number().optional(),
});

export const updateCommentReportStatusInputSchema = z.object({
  status: commentReportStatusSchema,
});

export const deleteReportedCommentResultSchema = z.object({
  message: z
    .string()
    .optional()
    .default("Reported comment deleted successfully"),
  report: z.unknown().optional(),
  comment: adminReportedCommentSchema.optional(),
});

export type CommentReportStatus = z.infer<typeof commentReportStatusSchema>;
export type AdminCommentReport = z.infer<typeof adminCommentReportSchema>;
export type AdminCommentReportsPaginated = z.infer<
  typeof adminCommentReportsPaginatedSchema
>;
export type AdminCommentReportsQuery = z.infer<
  typeof adminCommentReportsQuerySchema
>;
export type UpdateCommentReportStatusInput = z.infer<
  typeof updateCommentReportStatusInputSchema
>;
export type DeleteReportedCommentResult = z.infer<
  typeof deleteReportedCommentResultSchema
>;
