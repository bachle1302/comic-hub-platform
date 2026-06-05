"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";

import { getPublicSystemSettingsClientSafe } from "@/features/system-settings/api/public-system-settings.client-api";
import type { PublicSystemSettings } from "@/features/system-settings/api/system-settings.schema";
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
  const [settings, setSettings] = useState<PublicSystemSettings | null>(null);

  const shouldBypass = useMemo(() => isBypassPath(pathname), [pathname]);

  useEffect(() => {
    let isMounted = true;

    if (shouldBypass) {
      return undefined;
    }

    getPublicSystemSettingsClientSafe().then((nextSettings) => {
      if (isMounted) {
        setSettings(nextSettings);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [shouldBypass, pathname]);

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
