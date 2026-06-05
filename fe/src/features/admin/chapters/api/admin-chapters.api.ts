import {
  clientApiDelete,
  clientApiGet,
  clientApiPatch,
  clientApiPost,
} from "@/shared/api/client-api";
import {
  adminChapterListSchema,
  adminChapterSchema,
  deleteAdminChapterResultSchema,
  type AdminChapter,
  type AdminChaptersQuery,
  type CreateAdminChapterInput,
  type DeleteAdminChapterResult,
  type UpdateAdminChapterInput,
} from "./admin-chapters.schema";

function buildQueryString(query?: AdminChaptersQuery): string {
  if (!query?.deleted) {
    return "";
  }

  const params = new URLSearchParams({
    deleted: query.deleted,
  });

  return `?${params.toString()}`;
}

export function getAdminChapters(
  comicId: number,
  query?: AdminChaptersQuery,
): Promise<AdminChapter[]> {
  return clientApiGet(
    `/admin/comics/${comicId}/chapters${buildQueryString(query)}`,
    adminChapterListSchema,
    {
      auth: true,
    },
  );
}

export function getAdminChapter(id: number): Promise<AdminChapter> {
  return clientApiGet(`/admin/chapters/${id}`, adminChapterSchema, {
    auth: true,
  });
}

export function createAdminChapter(
  comicId: number,
  input: CreateAdminChapterInput,
): Promise<AdminChapter> {
  return clientApiPost(
    `/admin/comics/${comicId}/chapters`,
    adminChapterSchema,
    input,
    {
      auth: true,
    },
  );
}

export function updateAdminChapter(
  id: number,
  input: UpdateAdminChapterInput,
): Promise<AdminChapter> {
  return clientApiPatch(`/admin/chapters/${id}`, adminChapterSchema, input, {
    auth: true,
  });
}

export function deleteAdminChapter(
  id: number,
): Promise<DeleteAdminChapterResult> {
  return clientApiDelete(
    `/admin/chapters/${id}`,
    deleteAdminChapterResultSchema,
    {
      auth: true,
    },
  );
}
