"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  resendVerification,
  resendVerificationInputSchema,
  type ResendVerificationInput,
} from "@/features/auth";
import { PageContainer } from "@/shared/ui/PageContainer";

export default function ResendVerificationPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ResendVerificationInput>({
    resolver: zodResolver(resendVerificationInputSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(input: ResendVerificationInput) {
    setMessage(null);
    setErrorMessage(null);

    try {
      const result = await resendVerification(input);
      setMessage(result.message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Yêu cầu thất bại");
    }
  }

  return (
    <PageContainer>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-md space-y-4 rounded-lg border bg-card p-6"
      >
        <h1 className="text-2xl font-bold">Gửi lại email xác thực</h1>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Đang gửi..." : "Gửi email xác thực"}
        </Button>
        <Link href="/login" className="text-sm font-medium text-primary">
          Quay lại đăng nhập
        </Link>
      </form>
    </PageContainer>
  );
}
