import {
  clientApiDelete,
  clientApiGet,
  clientApiPatch,
  clientApiPost,
} from "@/shared/api/client-api";
import {
  batchCommentLikeStatusResultSchema,
  commentLikeStatusSchema,
  commentSchema,
  commentsPaginatedSchema,
  deleteCommentResultSchema,
  reportCommentResultSchema,
  type BatchCommentLikeStatusResult,
  type Comment,
  type CommentLikeStatus,
  type CommentsPaginated,
  type CreateCommentInput,
  type DeleteCommentResult,
  type ReportCommentInput,
  type ReportCommentResult,
  type UpdateCommentInput,
} from "./comments.schema";

type GetComicCommentsInput = {
  comicId: number;
  limit?: number;
  page?: number;
};

type GetChapterCommentsInput = {
  chapterId: number;
  limit?: number;
  page?: number;
};

function buildPaginationQuery(page?: number, limit?: number): string {
  const params = new URLSearchParams();

  if (page !== undefined) {
    params.set("page", String(page));
  }

  if (limit !== undefined) {
    params.set("limit", String(limit));
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function getComicComments({
  comicId,
  limit,
  page,
}: GetComicCommentsInput): Promise<CommentsPaginated> {
  return clientApiGet(
    `/comments/comics/${comicId}${buildPaginationQuery(page, limit)}`,
    commentsPaginatedSchema,
  );
}

export function getChapterComments({
  chapterId,
  limit,
  page,
}: GetChapterCommentsInput): Promise<CommentsPaginated> {
  return clientApiGet(
    `/comments/chapters/${chapterId}${buildPaginationQuery(page, limit)}`,
    commentsPaginatedSchema,
  );
}

export function createComment(input: CreateCommentInput): Promise<Comment> {
  return clientApiPost("/comments", commentSchema, input, {
    auth: true,
  });
}

export function updateComment(
  id: number,
  input: UpdateCommentInput,
): Promise<Comment> {
  return clientApiPatch(`/comments/${id}`, commentSchema, input, {
    auth: true,
  });
}

export function deleteComment(id: number): Promise<DeleteCommentResult> {
  return clientApiDelete(`/comments/${id}`, deleteCommentResultSchema, {
    auth: true,
  });
}

export function reportComment(
  commentId: number,
  input: ReportCommentInput,
): Promise<ReportCommentResult> {
  return clientApiPost(
    `/comments/${commentId}/report`,
    reportCommentResultSchema,
    input,
    {
      auth: true,
    },
  );
}

export function likeComment(commentId: number): Promise<CommentLikeStatus> {
  return clientApiPost(
    `/comments/${commentId}/like`,
    commentLikeStatusSchema,
    undefined,
    {
      auth: true,
    },
  );
}

export function unlikeComment(commentId: number): Promise<CommentLikeStatus> {
  return clientApiDelete(
    `/comments/${commentId}/like`,
    commentLikeStatusSchema,
    {
      auth: true,
    },
  );
}

export function getCommentLikeStatus(
  commentId: number,
): Promise<CommentLikeStatus> {
  return clientApiGet(
    `/comments/${commentId}/like-status`,
    commentLikeStatusSchema,
    {
      auth: true,
    },
  );
}

export function getBatchCommentLikeStatus(
  commentIds: number[],
): Promise<BatchCommentLikeStatusResult> {
  const uniqueCommentIds = Array.from(new Set(commentIds));

  if (uniqueCommentIds.length === 0) {
    return Promise.resolve({ items: [] });
  }

  return clientApiPost(
    "/comments/like-status/batch",
    batchCommentLikeStatusResultSchema,
    {
      commentIds: uniqueCommentIds,
    },
    {
      auth: true,
    },
  );
}
