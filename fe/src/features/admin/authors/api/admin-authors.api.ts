import {
  clientApiDelete,
  clientApiGet,
  clientApiPatch,
  clientApiPost,
} from "@/shared/api/client-api";
import {
  adminAuthorListSchema,
  adminAuthorSchema,
  deleteAdminAuthorResultSchema,
  type AdminAuthor,
  type CreateAdminAuthorInput,
  type DeleteAdminAuthorResult,
  type UpdateAdminAuthorInput,
} from "./admin-authors.schema";

export function getAdminAuthors(): Promise<AdminAuthor[]> {
  return clientApiGet("/admin/authors", adminAuthorListSchema, {
    auth: true,
  });
}

export function createAdminAuthor(
  input: CreateAdminAuthorInput,
): Promise<AdminAuthor> {
  return clientApiPost("/admin/authors", adminAuthorSchema, input, {
    auth: true,
  });
}

export function updateAdminAuthor(
  id: number,
  input: UpdateAdminAuthorInput,
): Promise<AdminAuthor> {
  return clientApiPatch(`/admin/authors/${id}`, adminAuthorSchema, input, {
    auth: true,
  });
}

export function deleteAdminAuthor(
  id: number,
): Promise<DeleteAdminAuthorResult> {
  return clientApiDelete(
    `/admin/authors/${id}`,
    deleteAdminAuthorResultSchema,
    {
      auth: true,
    },
  );
}
