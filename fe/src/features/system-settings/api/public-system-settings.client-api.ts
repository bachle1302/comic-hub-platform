import { clientApiGet } from "@/shared/api/client-api";

import {
  publicSystemSettingsSchema,
  type PublicSystemSettings,
} from "./system-settings.schema";

const PUBLIC_SETTINGS_CLIENT_CACHE_TTL_MS = 60_000;

let cachedSettings: PublicSystemSettings | null = null;
let cachedAt = 0;
let inFlightSettings: Promise<PublicSystemSettings> | null = null;

export async function getPublicSystemSettingsClientSafe(
  options?: { force?: boolean },
): Promise<PublicSystemSettings> {
  const now = Date.now();

  if (
    !options?.force &&
    cachedSettings &&
    now - cachedAt < PUBLIC_SETTINGS_CLIENT_CACHE_TTL_MS
  ) {
    return cachedSettings;
  }

  if (!options?.force && inFlightSettings) {
    return inFlightSettings;
  }

  inFlightSettings = loadPublicSystemSettingsClientSafe();

  return inFlightSettings;
}

async function loadPublicSystemSettingsClientSafe(): Promise<PublicSystemSettings> {
  try {
    const settings = await clientApiGet(
      "/system-settings/public",
      publicSystemSettingsSchema,
    );

    cachedSettings = settings;
    cachedAt = Date.now();

    return settings;
  } catch {
    cachedSettings = {};
    cachedAt = Date.now();

    return {};
  } finally {
    inFlightSettings = null;
  }
}
