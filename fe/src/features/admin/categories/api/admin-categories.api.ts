import {
  clientApiDelete,
  clientApiGet,
  clientApiPatch,
  clientApiPost,
} from "@/shared/api/client-api";
import {
  adminCategoryListSchema,
  adminCategorySchema,
  deleteAdminCategoryResultSchema,
  type AdminCategory,
  type CreateAdminCategoryInput,
  type DeleteAdminCategoryResult,
  type UpdateAdminCategoryInput,
} from "./admin-categories.schema";

export function getAdminCategories(): Promise<AdminCategory[]> {
  return clientApiGet("/admin/categories", adminCategoryListSchema, {
    auth: true,
  });
}

export function createAdminCategory(
  input: CreateAdminCategoryInput,
): Promise<AdminCategory> {
  return clientApiPost("/admin/categories", adminCategorySchema, input, {
    auth: true,
  });
}

export function updateAdminCategory(
  id: number,
  input: UpdateAdminCategoryInput,
): Promise<AdminCategory> {
  return clientApiPatch(`/admin/categories/${id}`, adminCategorySchema, input, {
    auth: true,
  });
}

export function deleteAdminCategory(
  id: number,
): Promise<DeleteAdminCategoryResult> {
  return clientApiDelete(
    `/admin/categories/${id}`,
    deleteAdminCategoryResultSchema,
    {
      auth: true,
    },
  );
}
