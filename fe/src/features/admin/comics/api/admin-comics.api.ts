import {
  clientApiDelete,
  clientApiGet,
  clientApiPatch,
  clientApiPost,
} from "@/shared/api/client-api";
import {
  adminComicListSchema,
  adminComicSchema,
  deleteAdminComicResultSchema,
  type AdminComic,
  type AdminComicsQuery,
  type CreateAdminComicInput,
  type DeleteAdminComicResult,
  type UpdateAdminComicInput,
} from "./admin-comics.schema";

function buildQueryString(query?: AdminComicsQuery): string {
  if (!query?.deleted) {
    return "";
  }

  const params = new URLSearchParams({
    deleted: query.deleted,
  });

  return `?${params.toString()}`;
}

export function getAdminComics(query?: AdminComicsQuery): Promise<AdminComic[]> {
  return clientApiGet(`/admin/comics${buildQueryString(query)}`, adminComicListSchema, {
    auth: true,
  });
}

export function createAdminComic(
  input: CreateAdminComicInput,
): Promise<AdminComic> {
  return clientApiPost("/admin/comics", adminComicSchema, input, {
    auth: true,
  });
}

export function updateAdminComic(
  id: number,
  input: UpdateAdminComicInput,
): Promise<AdminComic> {
  return clientApiPatch(`/admin/comics/${id}`, adminComicSchema, input, {
    auth: true,
  });
}

export function deleteAdminComic(id: number): Promise<DeleteAdminComicResult> {
  return clientApiDelete(
    `/admin/comics/${id}`,
    deleteAdminComicResultSchema,
    {
      auth: true,
    },
  );
}
