"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/model/auth-store";
import { getAccessToken } from "@/shared/auth/token-storage";
import type { NotificationSocket } from "@/shared/realtime/socket";
import {
  realtimeNotificationSchema,
  type RealtimeNotification,
} from "../api/notifications.schema";

type NotificationRealtimeContextValue = {
  latestNotification: RealtimeNotification | null;
  unreadBump: number;
  clearLatestNotification: () => void;
};

const NotificationRealtimeContext =
  createContext<NotificationRealtimeContextValue | null>(null);

type NotificationRealtimeProviderProps = {
  children: ReactNode;
};

export function NotificationRealtimeProvider({
  children,
}: NotificationRealtimeProviderProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [latestNotification, setLatestNotification] =
    useState<RealtimeNotification | null>(null);
  const [unreadBump, setUnreadBump] = useState(0);
  const receivedIdsRef = useRef<Set<number>>(new Set());
  const socketRef = useRef<NotificationSocket | null>(null);

  const clearLatestNotification = useCallback(() => {
    setLatestNotification(null);
  }, []);

  useEffect(() => {
    const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

    if (isAdminPath) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    if (isLoading) {
      return;
    }

    socketRef.current?.disconnect();
    socketRef.current = null;

    if (!isAuthenticated) {
      receivedIdsRef.current.clear();
      const task = window.setTimeout(() => {
        setLatestNotification(null);
        setUnreadBump(0);
      }, 0);

      return () => window.clearTimeout(task);
    }

    const token = getAccessToken();

    if (!token) {
      return;
    }

    let isActive = true;

    void import("@/shared/realtime/socket").then(
      ({ connectNotificationSocket }) => {
        if (!isActive) {
          return;
        }

        const socket = connectNotificationSocket({
          token,
          onNewNotification: (notification) => {
            const parsed = realtimeNotificationSchema.safeParse(notification);

            if (!parsed.success || receivedIdsRef.current.has(parsed.data.id)) {
              return;
            }

            receivedIdsRef.current.add(parsed.data.id);
            setLatestNotification(parsed.data);

            if (!parsed.data.isRead) {
              setUnreadBump((current) => current + 1);
            }
          },
        });

        socketRef.current = socket;
      },
    );

    return () => {
      isActive = false;
      const socket = socketRef.current;
      socket?.disconnect();

      if (socket && socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, isLoading, pathname]);

  const value = useMemo<NotificationRealtimeContextValue>(
    () => ({
      latestNotification,
      unreadBump,
      clearLatestNotification,
    }),
    [clearLatestNotification, latestNotification, unreadBump],
  );

  return (
    <NotificationRealtimeContext.Provider value={value}>
      {children}
    </NotificationRealtimeContext.Provider>
  );
}

export function useNotificationRealtime(): NotificationRealtimeContextValue {
  const context = useContext(NotificationRealtimeContext);

  if (!context) {
    throw new Error(
      "useNotificationRealtime must be used within NotificationRealtimeProvider",
    );
  }

  return context;
}
