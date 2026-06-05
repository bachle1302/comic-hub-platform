"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEmail } from "@/features/auth";
import { PageContainer } from "@/shared/ui/PageContainer";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying email...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!token) {
      const task = window.setTimeout(() => {
        setMessage("Missing verification token.");
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
          setMessage(error instanceof Error ? error.message : "Verify failed");
          setIsError(true);
        });
    }, 0);

    return () => window.clearTimeout(task);
  }, [token]);

  return (
    <PageContainer>
      <div className="mx-auto max-w-md space-y-4 rounded-lg border bg-card p-6">
        <h1 className="text-2xl font-bold">Verify email</h1>
        <p className={isError ? "text-sm text-destructive" : "text-sm"}>
          {message}
        </p>
        <Link href="/login" className="inline-flex text-sm font-medium text-primary">
          Go to login
        </Link>
      </div>
    </PageContainer>
  );
}
