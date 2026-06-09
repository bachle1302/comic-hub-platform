"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  changePassword,
  changePasswordFormSchema,
  useAuth,
  type ChangePasswordFormInput,
} from "@/features/auth";
import { PageContainer } from "@/shared/ui/PageContainer";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ChangePasswordFormInput>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login?next=/me/change-password");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  async function onSubmit(input: ChangePasswordFormInput) {
    setMessage(null);
    setErrorMessage(null);

    try {
      const result = await changePassword({
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      });
      setMessage(result.message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Đổi mật khẩu thất bại");
    }
  }

  if (isAuthLoading || !isAuthenticated) {
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground">Đang kiểm tra đăng nhập...</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-md space-y-4 rounded-lg border bg-card p-6"
      >
        <h1 className="text-2xl font-bold">Đổi mật khẩu</h1>
        <div className="space-y-2">
          <label htmlFor="currentPassword" className="text-sm font-medium">
            Mật khẩu hiện tại
          </label>
          <input
            id="currentPassword"
            type="password"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("currentPassword")}
          />
          {errors.currentPassword ? (
            <p className="text-sm text-destructive">
              {errors.currentPassword.message}
            </p>
          ) : null}
        </div>
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
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu..." : "Đổi mật khẩu"}
        </Button>
      </form>
    </PageContainer>
  );
}
