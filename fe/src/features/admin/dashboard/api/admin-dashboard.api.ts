import { clientApiGet } from "@/shared/api/client-api";
import {
  adminDashboardStatsSchema,
  type AdminDashboardStats,
} from "./admin-dashboard.schema";

export function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  return clientApiGet("/admin/dashboard/stats", adminDashboardStatsSchema, {
    auth: true,
  });
}
