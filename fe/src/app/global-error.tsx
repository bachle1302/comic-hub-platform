"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="vi">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
          <section className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Loi he thong</p>
            <h1 className="mt-2 text-2xl font-semibold">Khong tai duoc ung dung</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              He thong dang gap loi tam thoi. Vui long tai lai trang hoac quay ve trang chu.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                onClick={() => window.location.reload()}
              >
                Tai lai
              </button>
              <Link
                className="rounded-md border px-4 py-2 text-sm font-medium"
                href="/"
              >
                Ve trang chu
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
