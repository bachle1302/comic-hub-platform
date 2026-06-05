"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { getUnreadNotificationCount } from "../api/notifications.api";
import { useNotificationRealtime } from "../model/notification-realtime";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { unreadBump } = useNotificationRealtime();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const appliedUnreadBumpRef = useRef(0);

  const loadUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const result = await getUnreadNotificationCount();
      setUnreadCount(result.count);
    } catch {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      appliedUnreadBumpRef.current = unreadBump;
      const task = window.setTimeout(() => {
        setUnreadCount(0);
      }, 0);

      return () => window.clearTimeout(task);
    }

    const task = window.setTimeout(() => {
      void loadUnreadCount();
    }, 0);

    return () => window.clearTimeout(task);
  }, [isAuthenticated, isAuthLoading, loadUnreadCount, unreadBump]);

  useEffect(() => {
    const delta = unreadBump - appliedUnreadBumpRef.current;

    if (delta <= 0) {
      return;
    }

    appliedUnreadBumpRef.current = unreadBump;
    setUnreadCount((current) => current + delta);
  }, [unreadBump]);

  if (isAuthLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Thong bao"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-destructive px-1 text-[11px] font-semibold leading-5 text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </Button>

      {isOpen ? (
        <NotificationDropdown
          onChanged={async () => {
            await loadUnreadCount();
            appliedUnreadBumpRef.current = unreadBump;
          }}
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </div>
  );
}
