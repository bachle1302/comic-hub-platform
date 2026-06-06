"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/model/auth-store";
import { NotificationRealtimeProvider } from "@/features/notifications/model/notification-realtime";
import { PublicSettingsProvider } from "@/features/system-settings/model/PublicSettingsProvider";
import { MaintenanceGate } from "@/features/system-settings/ui/MaintenanceGate";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <PublicSettingsProvider>
        <NotificationRealtimeProvider>
          <MaintenanceGate>{children}</MaintenanceGate>
        </NotificationRealtimeProvider>
      </PublicSettingsProvider>
    </AuthProvider>
  );
}
