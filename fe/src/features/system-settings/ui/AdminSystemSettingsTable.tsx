"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  SystemSetting,
  SystemSettingValueType,
} from "../api/system-settings.schema";

type AdminSystemSettingsTableProps = {
  isUpdating?: boolean;
  onUpdate: (key: string, value: unknown) => Promise<void> | void;
  settings: SystemSetting[];
  updatingKey?: string | null;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function parseValueForSubmit(value: string, valueType: SystemSettingValueType) {
  switch (valueType) {
    case "NUMBER": {
      const parsed = Number(value);

      if (!Number.isFinite(parsed)) {
        throw new Error("Giá trị NUMBER phải là số hợp lệ");
      }

      return parsed;
    }
    case "BOOLEAN":
      return value === "true";
    case "JSON":
      return JSON.parse(value) as unknown;
    case "STRING":
    default:
      return value;
  }
}

function prettyValue(setting: SystemSetting): string {
  if (setting.valueType !== "JSON") {
    return setting.value;
  }

  try {
    return JSON.stringify(JSON.parse(setting.value) as unknown, null, 2);
  } catch {
    return setting.value;
  }
}

type EditState = {
  key: string;
  value: string;
};

export function AdminSystemSettingsTable({
  isUpdating = false,
  onUpdate,
  settings,
  updatingKey,
}: AdminSystemSettingsTableProps) {
  const [editState, setEditState] = useState<EditState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (settings.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Không có cấu hình nào.
      </div>
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    setting: SystemSetting,
  ) {
    event.preventDefault();

    if (!editState || editState.key !== setting.key) {
      return;
    }

    setErrorMessage(null);

    try {
      await onUpdate(
        setting.key,
        parseValueForSubmit(editState.value, setting.valueType),
      );
      setEditState(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Cập nhật cấu hình thất bại",
      );
    }
  }

  function renderEditControl(setting: SystemSetting) {
    if (!editState || editState.key !== setting.key) {
      return null;
    }

    if (setting.valueType === "BOOLEAN") {
      return (
        <select
          value={editState.value}
          onChange={(event) =>
            setEditState({
              key: setting.key,
              value: event.target.value,
            })
          }
          className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }

    if (setting.valueType === "JSON") {
      return (
        <textarea
          rows={5}
          value={editState.value}
          onChange={(event) =>
            setEditState({
              key: setting.key,
              value: event.target.value,
            })
          }
          className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-primary"
        />
      );
    }

    return (
      <textarea
        rows={setting.value.length > 80 ? 3 : 1}
        value={editState.value}
        onChange={(event) =>
          setEditState({
            key: setting.key,
            value: event.target.value,
          })
        }
        className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:border-primary"
      />
    );
  }

  return (
    <div className="space-y-3">
      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Key</th>
                <th className="px-4 py-3 font-medium">Nhóm</th>
                <th className="px-4 py-3 font-medium">Label</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Public</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((setting) => {
                const isEditing = editState?.key === setting.key;
                const isRowUpdating = isUpdating && updatingKey === setting.key;

                return (
                  <tr key={setting.key} className="border-t align-top">
                    <td className="px-4 py-3 font-mono text-xs">{setting.key}</td>
                    <td className="px-4 py-3">{setting.group}</td>
                    <td className="px-4 py-3">
                      <p>{setting.label ?? "-"}</p>
                      {setting.description ? (
                        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                          {setting.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="max-w-md px-4 py-3">
                      {isEditing ? (
                        <form
                          className="space-y-2"
                          onSubmit={(event) => void handleSubmit(event, setting)}
                        >
                          {renderEditControl(setting)}
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              size="sm"
                              disabled={isRowUpdating}
                            >
                              {isRowUpdating ? "Đang lưu..." : "Lưu"}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isRowUpdating}
                              onClick={() => setEditState(null)}
                            >
                              Hủy
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <pre className="max-h-28 whitespace-pre-wrap break-words rounded-md bg-muted/40 p-2 text-xs">
                          {prettyValue(setting) || "(rỗng)"}
                        </pre>
                      )}
                    </td>
                    <td className="px-4 py-3">{setting.valueType}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          setting.isPublic
                            ? "rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                        }
                      >
                        {setting.isPublic ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDate(setting.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isUpdating}
                          onClick={() => {
                            setErrorMessage(null);
                            setEditState({
                              key: setting.key,
                              value: prettyValue(setting),
                            });
                          }}
                        >
                          Sửa value
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

