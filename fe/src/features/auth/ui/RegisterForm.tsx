"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { registerInputSchema, type RegisterInput } from "../api/auth.schema";
import { useAuth } from "../model/auth-store";

export function RegisterForm() {
  const { register: registerAccount } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerInputSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(input: RegisterInput) {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await registerAccount(input);
      setSuccessMessage(
        result.message ??
          "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Đăng ký thất bại",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-md space-y-5 rounded-lg border bg-card p-6 shadow-sm"
    >
      <div>
        <h1 className="text-2xl font-bold">Đăng ký</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo tài khoản mới để theo dõi truyện.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Tên
        </label>
        <input
          id="name"
          autoComplete="name"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {successMessage ? (
        <div className="space-y-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          <p>{successMessage}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="font-medium underline">
              Đăng nhập
            </Link>
            <Link href="/resend-verification" className="font-medium underline">
              Gửi lại email xác thực
            </Link>
          </div>
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-primary">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
