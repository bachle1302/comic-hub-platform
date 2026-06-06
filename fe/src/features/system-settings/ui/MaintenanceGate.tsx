"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";

import { usePublicSettings } from "@/features/system-settings/model/PublicSettingsProvider";
import { MaintenancePage } from "@/shared/ui/MaintenancePage";

type MaintenanceGateProps = {
  children: ReactNode;
};

const BYPASS_PREFIXES = ["/admin", "/login", "/api", "/maintenance"];

function isBypassPath(pathname: string): boolean {
  return BYPASS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function MaintenanceGate({ children }: MaintenanceGateProps) {
  const pathname = usePathname();
  const { settings } = usePublicSettings();

  const shouldBypass = useMemo(() => isBypassPath(pathname), [pathname]);

  if (shouldBypass) {
    return <>{children}</>;
  }

  if (settings?.system?.maintenanceMode) {
    return (
      <MaintenancePage message={settings.system.maintenanceMessage ?? undefined} />
    );
  }

  return <>{children}</>;
}
