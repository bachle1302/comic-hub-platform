import { getPublicSystemSettingsSafe } from "@/features/system-settings/api/system-settings.api";
import { MaintenancePage } from "@/shared/ui/MaintenancePage";

export const dynamic = "force-dynamic";

export default async function MaintenanceRoutePage() {
  const settings = await getPublicSystemSettingsSafe();

  return (
    <MaintenancePage message={settings.system?.maintenanceMessage ?? undefined} />
  );
}
