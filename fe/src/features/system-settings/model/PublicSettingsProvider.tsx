"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import { getPublicSystemSettingsClientSafe } from "@/features/system-settings/api/public-system-settings.client-api";
import type { PublicSystemSettings } from "@/features/system-settings/api/system-settings.schema";

type PublicSettingsContextValue = {
  settings: PublicSystemSettings;
  isLoading: boolean;
  reload: () => Promise<void>;
};

type PublicSettingsProviderProps = {
  children: ReactNode;
};

const PublicSettingsContext = createContext<PublicSettingsContextValue | null>(
  null,
);

function shouldSkipPublicSettings(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function PublicSettingsProvider({
  children,
}: PublicSettingsProviderProps) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<PublicSystemSettings>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadSettings = useCallback(async (force = false) => {
    setIsLoading(true);

    try {
      const nextSettings = await getPublicSystemSettingsClientSafe({ force });
      setSettings(nextSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    if (shouldSkipPublicSettings(pathname)) {
      return undefined;
    }

    getPublicSystemSettingsClientSafe()
      .then((nextSettings) => {
        if (isActive) {
          setSettings(nextSettings);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [pathname]);

  const value = useMemo<PublicSettingsContextValue>(
    () => ({
      settings,
      isLoading,
      reload: () => loadSettings(true),
    }),
    [isLoading, loadSettings, settings],
  );

  return (
    <PublicSettingsContext.Provider value={value}>
      {children}
    </PublicSettingsContext.Provider>
  );
}

export function usePublicSettings(): PublicSettingsContextValue {
  const context = useContext(PublicSettingsContext);

  if (!context) {
    throw new Error("usePublicSettings must be used within PublicSettingsProvider");
  }

  return context;
}
