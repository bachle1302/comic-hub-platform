import {
  clientApiDelete,
  clientApiGet,
  clientApiPatch,
} from "@/shared/api/client-api";
import {
  adminCommentReportSchema,
  adminCommentReportsPaginatedSchema,
  deleteReportedCommentResultSchema,
  type AdminCommentReport,
  type AdminCommentReportsPaginated,
  type AdminCommentReportsQuery,
  type DeleteReportedCommentResult,
  type UpdateCommentReportStatusInput,
} from "./admin-comment-reports.schema";

function buildQueryString(query?: AdminCommentReportsQuery): string {
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

  if (query.status !== undefined) {
    params.set("status", query.status);
  }

  if (query.commentId !== undefined) {
    params.set("commentId", String(query.commentId));
  }

  if (query.userId !== undefined) {
    params.set("userId", String(query.userId));
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function getAdminCommentReports(
  query?: AdminCommentReportsQuery,
): Promise<AdminCommentReportsPaginated> {
  return clientApiGet(
    `/admin/comment-reports${buildQueryString(query)}`,
    adminCommentReportsPaginatedSchema,
    {
      auth: true,
    },
  );
}

export function updateAdminCommentReportStatus(
  id: number,
  input: UpdateCommentReportStatusInput,
): Promise<AdminCommentReport> {
  return clientApiPatch(
    `/admin/comment-reports/${id}/status`,
    adminCommentReportSchema,
    input,
    {
      auth: true,
    },
  );
}

export function deleteReportedComment(
  reportId: number,
): Promise<DeleteReportedCommentResult> {
  return clientApiDelete(
    `/admin/comment-reports/${reportId}/comment`,
    deleteReportedCommentResultSchema,
    {
      auth: true,
    },
  );
}
