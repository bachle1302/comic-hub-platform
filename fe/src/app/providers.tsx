"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ReactNode } from "react";
import { AuthProvider } from "@/features/auth";
import { NotificationRealtimeProvider } from "@/features/notifications";
import { PublicSettingsProvider } from "@/features/system-settings";
import { MaintenanceGate } from "@/features/system-settings/ui/MaintenanceGate";
import { GOOGLE_CLIENT_ID } from "@/shared/config/env";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const tree = (
    <AuthProvider>
      <PublicSettingsProvider>
        <NotificationRealtimeProvider>
          <MaintenanceGate>{children}</MaintenanceGate>
        </NotificationRealtimeProvider>
      </PublicSettingsProvider>
    </AuthProvider>
  );

  if (!GOOGLE_CLIENT_ID) {
    return tree;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {tree}
    </GoogleOAuthProvider>
  );
}
