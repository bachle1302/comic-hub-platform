"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { reportComment } from "../api/comments.api";
import {
  reportCommentInputSchema,
  type ReportCommentInput,
} from "../api/comments.schema";

type ReportCommentDialogProps = {
  commentId: number;
  onReported?: () => Promise<void> | void;
  trigger?: ReactNode;
};

function getFriendlyErrorMessage(message: string): string {
  if (message.toLowerCase().includes("already reported")) {
    return "Ban da bao cao binh luan nay roi.";
  }

  return message;
}

export function ReportCommentDialog({
  commentId,
  onReported,
  trigger,
}: ReportCommentDialogProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ReportCommentInput>({
    resolver: zodResolver(reportCommentInputSchema),
    defaultValues: {
      reason: "",
    },
  });

  function handleOpen() {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
    setErrorMessage(null);
    reset({
      reason: "",
    });
  }

  async function handleValidSubmit(input: ReportCommentInput) {
    setMessage(null);
    setErrorMessage(null);

    try {
      const result = await reportComment(commentId, input);
      setMessage(
        result.report.status === "PENDING"
          ? "Da gui bao cao binh luan."
          : "Bao cao da duoc ghi nhan.",
      );
      await onReported?.();
      handleClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? getFriendlyErrorMessage(error.message)
          : "Bao cao binh luan that bai",
      );
    }
  }

  return (
    <>
      <button
        type="button"
        className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={handleOpen}
      >
        {trigger ?? "Bao cao"}
      </button>

      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border bg-background p-5 shadow-lg">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Bao cao binh luan</h2>
              <p className="text-sm text-muted-foreground">
                Cho admin biet ly do binh luan nay can duoc xem xet.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(handleValidSubmit)}
              className="mt-4 space-y-4"
            >
              <label className="block space-y-2 text-sm">
                <span className="font-medium">Ly do</span>
                <textarea
                  rows={5}
                  className="min-h-28 w-full resize-y rounded-md border bg-background px-3 py-2 outline-none focus:border-primary"
                  placeholder="Spam, noi dung khong phu hop..."
                  {...register("reason")}
                />
              </label>

              {errors.reason ? (
                <p className="text-sm text-destructive">
                  {errors.reason.message}
                </p>
              ) : null}

              {errorMessage ? (
                <p className="text-sm text-destructive">{errorMessage}</p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Huy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Dang gui..." : "Gui bao cao"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
