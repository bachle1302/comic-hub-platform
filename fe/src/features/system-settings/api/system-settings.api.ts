import { clientApiGet, clientApiPatch } from "@/shared/api/client-api";
import { serverApiGet } from "@/shared/api/server-api";
import {
  publicSystemSettingsSchema,
  systemSettingSchema,
  updateSystemSettingInputSchema,
  type AdminSystemSettingsQuery,
  type PublicSystemSettings,
  type SystemSetting,
} from "./system-settings.schema";

const systemSettingsListSchema = systemSettingSchema.array();

function buildAdminSettingsQuery(query?: AdminSystemSettingsQuery): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  if (query.group?.trim()) {
    params.set("group", query.group.trim());
  }

  if (query.isPublic !== undefined) {
    params.set("isPublic", String(query.isPublic));
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function getPublicSystemSettings(): Promise<PublicSystemSettings> {
  return serverApiGet("/system-settings/public", publicSystemSettingsSchema, {
    revalidate: 300,
    tags: ["system-settings"],
  });
}

export async function getPublicSystemSettingsSafe(): Promise<PublicSystemSettings> {
  try {
    return await getPublicSystemSettings();
  } catch {
    return {};
  }
}

export function getAdminSystemSettings(
  query?: AdminSystemSettingsQuery,
): Promise<SystemSetting[]> {
  return clientApiGet(
    `/admin/system-settings${buildAdminSettingsQuery(query)}`,
    systemSettingsListSchema,
    {
      auth: true,
    },
  );
}

export function updateAdminSystemSetting(
  key: string,
  value: unknown,
): Promise<SystemSetting> {
  const input = updateSystemSettingInputSchema.parse({
    value,
  });

  return clientApiPatch(
    `/admin/system-settings/${encodeURIComponent(key)}`,
    systemSettingSchema,
    input,
    {
      auth: true,
    },
  );
}

