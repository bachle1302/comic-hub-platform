import {
  clientApiDelete,
  clientApiGet,
  clientApiPatch,
  clientApiPost,
} from "@/shared/api/client-api";
import {
  adminCoinPackageSchema,
  adminCoinPackagesPaginatedSchema,
  deleteAdminCoinPackageResultSchema,
  type AdminCoinPackage,
  type AdminCoinPackagesPaginated,
  type AdminCoinPackagesQuery,
  type CreateAdminCoinPackageInput,
  type DeleteAdminCoinPackageResult,
  type UpdateAdminCoinPackageInput,
} from "./admin-coin-packages.schema";

function buildQueryString(query?: AdminCoinPackagesQuery): string {
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

  if (query.q?.trim()) {
    params.set("q", query.q.trim());
  }

  if (query.isActive !== undefined) {
    params.set("isActive", String(query.isActive));
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function getAdminCoinPackages(
  query?: AdminCoinPackagesQuery,
): Promise<AdminCoinPackagesPaginated> {
  return clientApiGet(
    `/admin/coin-packages${buildQueryString(query)}`,
    adminCoinPackagesPaginatedSchema,
    {
      auth: true,
    },
  );
}

export function getAdminCoinPackage(id: number): Promise<AdminCoinPackage> {
  return clientApiGet(`/admin/coin-packages/${id}`, adminCoinPackageSchema, {
    auth: true,
  });
}

export function createAdminCoinPackage(
  input: CreateAdminCoinPackageInput,
): Promise<AdminCoinPackage> {
  return clientApiPost("/admin/coin-packages", adminCoinPackageSchema, input, {
    auth: true,
  });
}

export function updateAdminCoinPackage(
  id: number,
  input: UpdateAdminCoinPackageInput,
): Promise<AdminCoinPackage> {
  return clientApiPatch(
    `/admin/coin-packages/${id}`,
    adminCoinPackageSchema,
    input,
    {
      auth: true,
    },
  );
}

export function deleteAdminCoinPackage(
  id: number,
): Promise<DeleteAdminCoinPackageResult> {
  return clientApiDelete(
    `/admin/coin-packages/${id}`,
    deleteAdminCoinPackageResultSchema,
    {
      auth: true,
    },
  );
}
