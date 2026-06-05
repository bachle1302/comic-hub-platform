"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/shared/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorState
      title="Khong tai duoc trang"
      message="He thong dang gap loi tam thoi. Vui long thu lai."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={reset}>
            Thu lai
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Ve trang chu</Link>
          </Button>
        </div>
      }
    />
  );
}
