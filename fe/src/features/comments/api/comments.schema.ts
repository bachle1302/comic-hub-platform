import { z } from "zod";

export const commentUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  avatar: z.string().nullable().optional(),
});

export const commentReplySchema = z.object({
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
  likeCount: z.number().optional().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: commentUserSchema.optional(),
});

export const commentSchema = commentReplySchema.extend({
  replies: z.array(commentReplySchema).optional().default([]),
});

export const commentsMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export const commentsPaginatedSchema = z.object({
  items: z.array(commentSchema),
  meta: commentsMetaSchema,
});

export const createCommentInputSchema = z
  .object({
    comicId: z.number().optional(),
    chapterId: z.number().optional(),
    parentId: z.number().optional(),
    content: z.string().trim().min(1).max(1000),
  })
  .refine(
    (input) =>
      input.comicId !== undefined ||
      input.chapterId !== undefined ||
      input.parentId !== undefined,
    {
      message: "comicId, chapterId or parentId is required",
    },
  );

export const updateCommentInputSchema = z.object({
  content: z.string().trim().min(1).max(1000),
});

export const deletedCommentSummarySchema = z.object({
  id: z.number().optional(),
  deletedAt: z.string().nullable().optional(),
  deletedById: z.number().nullable().optional(),
  deleteReason: z.string().nullable().optional(),
  isDeleted: z.boolean().optional().default(true),
});

export const deleteCommentResultSchema = z.object({
  message: z.string().optional().default("Comment deleted successfully"),
  comment: deletedCommentSummarySchema.optional(),
});

export const reportCommentInputSchema = z.object({
  reason: z.string().trim().min(3).max(500),
});

export const commentReportStatusSchema = z.enum([
  "PENDING",
  "RESOLVED",
  "REJECTED",
]);

export const commentReportSchema = z.object({
  id: z.number(),
  commentId: z.number(),
  userId: z.number(),
  reason: z.string(),
  status: commentReportStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const reportCommentResultSchema = z.object({
  report: commentReportSchema,
});

export const commentLikeStatusSchema = z.object({
  isLiked: z.boolean(),
  likeCount: z.number(),
});

export const batchCommentLikeStatusInputSchema = z.object({
  commentIds: z.array(z.number()).min(1).max(200),
});

export const batchCommentLikeStatusItemSchema = z.object({
  commentId: z.number(),
  isLiked: z.boolean(),
});

export const batchCommentLikeStatusResultSchema = z.object({
  items: z.array(batchCommentLikeStatusItemSchema),
});

export type Comment = z.infer<typeof commentSchema>;
export type CommentReply = z.infer<typeof commentReplySchema>;
export type CommentsPaginated = z.infer<typeof commentsPaginatedSchema>;
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;
export type DeleteCommentResult = z.infer<typeof deleteCommentResultSchema>;
export type ReportCommentInput = z.infer<typeof reportCommentInputSchema>;
export type CommentReport = z.infer<typeof commentReportSchema>;
export type ReportCommentResult = z.infer<typeof reportCommentResultSchema>;
export type CommentLikeStatus = z.infer<typeof commentLikeStatusSchema>;
export type BatchCommentLikeStatusInput = z.infer<
  typeof batchCommentLikeStatusInputSchema
>;
export type BatchCommentLikeStatusItem = z.infer<
  typeof batchCommentLikeStatusItemSchema
>;
export type BatchCommentLikeStatusResult = z.infer<
  typeof batchCommentLikeStatusResultSchema
>;
