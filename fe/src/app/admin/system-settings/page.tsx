"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminSystemSettingsFilter,
  AdminSystemSettingsTable,
  getAdminSystemSettings,
  updateAdminSystemSetting,
  type AdminSystemSettingsQuery,
  type SystemSetting,
} from "@/features/system-settings";

export default function AdminSystemSettingsPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState<AdminSystemSettingsQuery>({});
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const loadSettings = useCallback(async (nextQuery: AdminSystemSettingsQuery) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setSettings(await getAdminSystemSettings(nextQuery));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không tải được cấu hình",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadSettings(query);
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadSettings, query]);

  async function handleUpdate(key: string, value: unknown) {
    setUpdatingKey(key);
    setErrorMessage(null);

    try {
      await updateAdminSystemSetting(key, value);
      await loadSettings(query);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Cập nhật cấu hình thất bại",
      );
      throw error;
    } finally {
      setUpdatingKey(null);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Cấu hình hệ thống</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý tên site, email hỗ trợ, social links, SEO mặc định và chế độ
          bảo trì.
        </p>
      </div>

      <AdminSystemSettingsFilter initialQuery={query} onChange={setQuery} />

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Đang tải cấu hình...
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            Tổng {settings.length} cấu hình
          </div>
          <AdminSystemSettingsTable
            settings={settings}
            isUpdating={Boolean(updatingKey)}
            updatingKey={updatingKey}
            onUpdate={handleUpdate}
          />
        </>
      )}
    </section>
  );
}
