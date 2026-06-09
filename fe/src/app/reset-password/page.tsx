"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  resetPassword,
  resetPasswordFormSchema,
  type ResetPasswordFormInput,
} from "@/features/auth";
import { PageContainer } from "@/shared/ui/PageContainer";

export default function ResetPasswordPage() {
  const token = useSearchParams().get("token") ?? "";
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { token, newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(input: ResetPasswordFormInput) {
    setMessage(null);
    setErrorMessage(null);

    try {
      const result = await resetPassword({
        token: input.token,
        newPassword: input.newPassword,
      });
      setMessage(result.message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Đặt lại mật khẩu thất bại");
    }
  }

  return (
    <PageContainer>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-md space-y-4 rounded-lg border bg-card p-6"
      >
        <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
        {!token ? <p className="text-sm text-destructive">Thiếu mã xác thực.</p> : null}
        <input type="hidden" {...register("token")} />
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium">
            Mật khẩu mới
          </label>
          <input
            id="newPassword"
            type="password"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("newPassword")}
          />
          {errors.newPassword ? (
            <p className="text-sm text-destructive">
              {errors.newPassword.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Xác nhận mật khẩu
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
          {isSubmitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
        </Button>
        <Link href="/login" className="text-sm font-medium text-primary">
          Quay lại đăng nhập
        </Link>
      </form>
    </PageContainer>
  );
}
