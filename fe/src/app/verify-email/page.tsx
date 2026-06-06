"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEmail } from "@/features/auth";
import { PageContainer } from "@/shared/ui/PageContainer";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Đang xác minh email...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!token) {
      const task = window.setTimeout(() => {
        setMessage("Thiếu token xác minh email.");
        setIsError(true);
      }, 0);

      return () => window.clearTimeout(task);
    }

    const task = window.setTimeout(() => {
      void verifyEmail({ token })
        .then((result) => {
          setMessage(result.message);
          setIsError(false);
        })
        .catch((error: unknown) => {
          const errorMessage =
            error instanceof Error ? error.message : "Xác minh email thất bại";
          const friendlyMessage =
            errorMessage === "Invalid or expired token"
              ? "Link xác minh không hợp lệ, đã hết hạn hoặc đã được sử dụng."
              : errorMessage;

          setMessage(friendlyMessage);
          setIsError(true);
        });
    }, 0);

    return () => window.clearTimeout(task);
  }, [token]);

  return (
    <PageContainer>
      <div className="mx-auto max-w-md space-y-4 rounded-lg border bg-card p-6">
        <h1 className="text-2xl font-bold">Xác minh email</h1>
        <p className={isError ? "text-sm text-destructive" : "text-sm"}>
          {message}
        </p>
        <div className="flex flex-wrap gap-3 text-sm font-medium">
          <Link href="/login" className="inline-flex text-primary">
            Đăng nhập
          </Link>
          {isError ? (
            <Link href="/resend-verification" className="inline-flex text-primary">
              Gửi lại email xác minh
            </Link>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
