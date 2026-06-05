import { clientApiGet, clientApiPatch } from "@/shared/api/client-api";
import {
  adjustUserCoinResultSchema,
  adminTransactionsPaginatedSchema,
  adminUserDetailSchema,
  adminUsersPaginatedSchema,
  banUserResultSchema,
  unbanUserResultSchema,
  type AdjustUserCoinInput,
  type AdjustUserCoinResult,
  type AdminTransactionsPaginated,
  type AdminUserDetail,
  type AdminUsersPaginated,
  type AdminUsersQuery,
  type BanUserInput,
  type BanUserResult,
  type UnbanUserResult,
} from "./admin-users.schema";

type UserTransactionsQuery = {
  limit?: number;
  page?: number;
};

function buildUsersQueryString(query?: AdminUsersQuery): string {
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

  if (query.role !== undefined) {
    params.set("role", query.role);
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

function buildPaginationQueryString(query?: UserTransactionsQuery): string {
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

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function getAdminUsers(
  query?: AdminUsersQuery,
): Promise<AdminUsersPaginated> {
  return clientApiGet(
    `/admin/users${buildUsersQueryString(query)}`,
    adminUsersPaginatedSchema,
    {
      auth: true,
    },
  );
}

export function getAdminUserDetail(id: number): Promise<AdminUserDetail> {
  return clientApiGet(`/admin/users/${id}`, adminUserDetailSchema, {
    auth: true,
  });
}

export function adjustUserCoin(
  id: number,
  input: AdjustUserCoinInput,
): Promise<AdjustUserCoinResult> {
  return clientApiPatch(
    `/admin/users/${id}/coin`,
    adjustUserCoinResultSchema,
    input,
    {
      auth: true,
    },
  );
}

export function banAdminUser(
  id: number,
  input: BanUserInput,
): Promise<BanUserResult> {
  return clientApiPatch(`/admin/users/${id}/ban`, banUserResultSchema, input, {
    auth: true,
  });
}

export function unbanAdminUser(id: number): Promise<UnbanUserResult> {
  return clientApiPatch(
    `/admin/users/${id}/unban`,
    unbanUserResultSchema,
    undefined,
    {
      auth: true,
    },
  );
}

export function getAdminUserTransactions(
  id: number,
  query?: UserTransactionsQuery,
): Promise<AdminTransactionsPaginated> {
  return clientApiGet(
    `/admin/users/${id}/transactions${buildPaginationQueryString(query)}`,
    adminTransactionsPaginatedSchema,
    {
      auth: true,
    },
  );
}
