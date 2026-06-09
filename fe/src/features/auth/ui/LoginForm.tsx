"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { loginInputSchema, type LoginInput } from "../api/auth.schema";
import { useAuth } from "../model/auth-store";
import { GoogleLoginButton } from "./GoogleLoginButton";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(input: LoginInput) {
    setErrorMessage(null);

    try {
      const result = await login(input);
      const next = searchParams.get("next");
      router.push(next ?? (result.user.role === "ADMIN" ? "/admin" : "/"));
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Đăng nhập thất bại",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-md space-y-5 rounded-lg border bg-card p-6 shadow-sm"
    >
      <div>
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sử dụng tài khoản của bạn để tiếp tục.
        </p>
      </div>

      <GoogleLoginButton />

      <div className="text-center text-xs text-muted-foreground">
        Hoặc đăng nhập bằng email
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
          autoComplete="current-password"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <p>{errorMessage}</p>
          {errorMessage.toLowerCase().includes("verify") ? (
            <Link href="/resend-verification" className="mt-2 inline-block underline">
              Gửi lại email xác thực
            </Link>
          ) : null}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/forgot-password" className="font-medium text-primary">
          Quên mật khẩu?
        </Link>
      </p>

      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-primary">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
