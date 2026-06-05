import { clientApiGet } from "@/shared/api/client-api";

import {
  publicSystemSettingsSchema,
  type PublicSystemSettings,
} from "./system-settings.schema";

export async function getPublicSystemSettingsClientSafe(): Promise<PublicSystemSettings> {
  try {
    return await clientApiGet(
      "/system-settings/public",
      publicSystemSettingsSchema,
    );
  } catch {
    return {};
  }
}
