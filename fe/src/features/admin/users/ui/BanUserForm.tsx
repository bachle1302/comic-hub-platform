"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/shared/utils/format";
import {
  banUserInputSchema,
  type BanUserInput,
} from "../api/admin-users.schema";
import { banAdminUser, unbanAdminUser } from "../api/admin-users.api";

type BanUserFormProps = {
  banReason?: string | null;
  bannedAt?: string | null;
  isBanned: boolean;
  onChanged: () => Promise<void> | void;
  userId: number;
};

export function BanUserForm({
  banReason,
  bannedAt,
  isBanned,
  onChanged,
  userId,
}: BanUserFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnbanning, setIsUnbanning] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<BanUserInput>({
    resolver: zodResolver(banUserInputSchema),
    defaultValues: {
      reason: "",
    },
  });

  useEffect(() => {
    reset({
      reason: "",
    });
  }, [isBanned, reset]);

  async function submit(input: BanUserInput) {
    const confirmed = window.confirm(
      "Ban user nay? User se khong dang nhap va khong goi duoc protected APIs.",
    );

    if (!confirmed) {
      return;
    }

    setMessage(null);
    setErrorMessage(null);

    try {
      await banAdminUser(userId, {
        reason: input.reason?.trim() || undefined,
      });
      setMessage("Da ban user.");
      reset({
        reason: "",
      });
      await onChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Ban user that bai",
      );
    }
  }

  async function handleUnban() {
    const confirmed = window.confirm("Mo khoa user nay?");

    if (!confirmed) {
      return;
    }

    setIsUnbanning(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      await unbanAdminUser(userId);
      setMessage("Da unban user.");
      await onChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unban user that bai",
      );
    } finally {
      setIsUnbanning(false);
    }
  }

  if (isBanned) {
    return (
      <div className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div>
          <h2 className="text-lg font-semibold text-destructive">
            Tai khoan dang bi ban
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            User nay dang bi chan dang nhap va protected actions.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border bg-background p-3">
            <p className="text-xs text-muted-foreground">Banned at</p>
            <p className="mt-1 text-sm font-medium">
              {bannedAt ? formatDate(bannedAt) : "-"}
            </p>
          </div>
          <div className="rounded-md border bg-background p-3">
            <p className="text-xs text-muted-foreground">Reason</p>
            <p className="mt-1 break-words text-sm font-medium">
              {banReason || "-"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isUnbanning}
          onClick={handleUnban}
        >
          {isUnbanning ? "Dang unban..." : "Unban user"}
        </Button>

        {message ? <p className="text-sm text-green-600">{message}</p> : null}
        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-4 rounded-lg border bg-card p-4"
    >
      <div>
        <h2 className="text-lg font-semibold">Ban user</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          User bi ban se khong dang nhap, refresh token se bi revoke o backend.
        </p>
      </div>

      <label className="space-y-2 text-sm">
        <span className="font-medium">Ly do</span>
        <textarea
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:border-primary"
          placeholder="VD: Spam comment"
          {...register("reason")}
        />
        {errors.reason ? (
          <p className="text-sm text-destructive">{errors.reason.message}</p>
        ) : null}
      </label>

      <Button type="submit" variant="destructive" disabled={isSubmitting}>
        {isSubmitting ? "Dang ban..." : "Ban user"}
      </Button>

      {message ? <p className="text-sm text-green-600">{message}</p> : null}
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </form>
  );
}
