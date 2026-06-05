import { clientApiGet } from "@/shared/api/client-api";
import {
  adminAuditLogsPaginatedSchema,
  type AdminAuditLogsPaginated,
  type AdminAuditLogsQuery,
} from "./admin-audit-logs.schema";

function buildQueryString(query?: AdminAuditLogsQuery): string {
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

  if (query.adminId !== undefined) {
    params.set("adminId", String(query.adminId));
  }

  if (query.action !== undefined) {
    params.set("action", query.action);
  }

  if (query.entityType) {
    params.set("entityType", query.entityType);
  }

  if (query.entityId) {
    params.set("entityId", query.entityId);
  }

  if (query.dateFrom) {
    params.set("dateFrom", query.dateFrom);
  }

  if (query.dateTo) {
    params.set("dateTo", query.dateTo);
  }

  if (query.q) {
    params.set("q", query.q);
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function getAdminAuditLogs(
  query?: AdminAuditLogsQuery,
): Promise<AdminAuditLogsPaginated> {
  return clientApiGet(
    `/admin/audit-logs${buildQueryString(query)}`,
    adminAuditLogsPaginatedSchema,
    {
      auth: true,
    },
  );
}
