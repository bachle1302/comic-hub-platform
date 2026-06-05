import { clientApiDelete, clientApiGet } from "@/shared/api/client-api";
import {
  adminCommentsPaginatedSchema,
  deleteAdminCommentResultSchema,
  type AdminCommentsPaginated,
  type AdminCommentsQuery,
  type DeleteAdminCommentResult,
} from "./admin-comments.schema";

function buildQueryString(query?: AdminCommentsQuery): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }

  if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }

  if (query.comicId !== undefined) {
    params.set("comicId", String(query.comicId));
  }

  if (query.chapterId !== undefined) {
    params.set("chapterId", String(query.chapterId));
  }

  if (query.deleted !== undefined) {
    params.set("deleted", query.deleted);
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function getAdminComments(
  query?: AdminCommentsQuery,
): Promise<AdminCommentsPaginated> {
  return clientApiGet(
    `/admin/comments${buildQueryString(query)}`,
    adminCommentsPaginatedSchema,
    {
      auth: true,
    },
  );
}

export function deleteAdminComment(
  id: number,
): Promise<DeleteAdminCommentResult> {
  return clientApiDelete(
    `/admin/comments/${id}`,
    deleteAdminCommentResultSchema,
    {
      auth: true,
    },
  );
}
