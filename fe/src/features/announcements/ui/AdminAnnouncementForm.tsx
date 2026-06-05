"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  announcementInputSchema,
  type Announcement,
  type AnnouncementInput,
} from "../api/announcements.schema";

type AdminAnnouncementFormProps = {
  initialAnnouncement?: Announcement;
  onSubmit: (input: AnnouncementInput) => Promise<void>;
  submitLabel?: string;
};

type FormValues = {
  title: string;
  message: string;
  type: AnnouncementInput["type"];
  target: AnnouncementInput["target"];
  linkUrl: string;
  linkLabel: string;
  isActive: boolean;
  priority: number;
  startsAt: string;
  endsAt: string;
};

function toDateTimeLocal(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toIsoDateTime(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

function toInput(values: FormValues): AnnouncementInput {
  return {
    title: values.title.trim(),
    message: values.message.trim(),
    type: values.type,
    target: values.target,
    linkUrl: values.linkUrl.trim() || undefined,
    linkLabel: values.linkLabel.trim() || undefined,
    isActive: values.isActive,
    priority: values.priority,
    startsAt: toIsoDateTime(values.startsAt),
    endsAt: toIsoDateTime(values.endsAt),
  };
}

export function AdminAnnouncementForm({
  initialAnnouncement,
  onSubmit,
  submitLabel = "Luu thong bao",
}: AdminAnnouncementFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
  } = useForm<FormValues>({
    defaultValues: {
      title: initialAnnouncement?.title ?? "",
      message: initialAnnouncement?.message ?? "",
      type: initialAnnouncement?.type ?? "INFO",
      target: initialAnnouncement?.target ?? "ALL",
      linkUrl: initialAnnouncement?.linkUrl ?? "",
      linkLabel: initialAnnouncement?.linkLabel ?? "",
      isActive: initialAnnouncement?.isActive ?? true,
      priority: initialAnnouncement?.priority ?? 0,
      startsAt: toDateTimeLocal(initialAnnouncement?.startsAt),
      endsAt: toDateTimeLocal(initialAnnouncement?.endsAt),
    },
  });

  async function submit(values: FormValues) {
    setErrorMessage(null);

    const parsed = announcementInputSchema.safeParse(toInput(values));

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Du lieu khong hop le");
      return;
    }

    try {
      await onSubmit(parsed.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Luu thong bao that bai",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-5 rounded-lg border bg-card p-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm md:col-span-2">
          <span className="font-medium">Title</span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            {...register("title")}
          />
        </label>

        <label className="space-y-2 text-sm md:col-span-2">
          <span className="font-medium">Message</span>
          <textarea
            rows={5}
            className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:border-primary"
            {...register("message")}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Type</span>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            {...register("type")}
          >
            <option value="INFO">INFO</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="WARNING">WARNING</option>
            <option value="DANGER">DANGER</option>
            <option value="PROMOTION">PROMOTION</option>
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Target</span>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            {...register("target")}
          >
            <option value="ALL">ALL</option>
            <option value="AUTHENTICATED">AUTHENTICATED</option>
            <option value="GUEST">GUEST</option>
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Link URL</span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            placeholder="/me/wallet"
            {...register("linkUrl")}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Link label</span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            placeholder="Nap ngay"
            {...register("linkLabel")}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Priority</span>
          <input
            type="number"
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            {...register("priority", { valueAsNumber: true })}
          />
        </label>

        <label className="flex items-center gap-2 pt-7 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            {...register("isActive")}
          />
          <span className="font-medium">Active</span>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Starts at</span>
          <input
            type="datetime-local"
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            {...register("startsAt")}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Ends at</span>
          <input
            type="datetime-local"
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            {...register("endsAt")}
          />
        </label>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Dang luu..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
