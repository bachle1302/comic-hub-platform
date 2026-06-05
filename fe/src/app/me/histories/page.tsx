"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import {
  HistoryList,
  deleteHistory,
  getMyHistories,
  type HistoryItem,
} from "@/features/histories";

export default function MyHistoriesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadHistories = useCallback(async () => {
    setIsFetching(true);
    setErrorMessage(null);

    try {
      setHistories(await getMyHistories());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Khong tai duoc lich su doc",
      );
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login?next=/me/histories");
      return;
    }

    const task = window.setTimeout(() => {
      void loadHistories();
    }, 0);

    return () => window.clearTimeout(task);
  }, [isAuthenticated, isLoading, loadHistories, router]);

  async function handleDelete(id: number) {
    if (!window.confirm("Xoa lich su doc nay?")) {
      return;
    }

    await deleteHistory(id);
    await loadHistories();
  }

  if (isLoading || isFetching) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Dang tai lich su doc...
      </div>
    );
  }

  if (errorMessage) {
    return <div className="rounded-lg border p-6 text-sm">{errorMessage}</div>;
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Lich su doc</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tiep tuc doc tu chuong gan nhat.
        </p>
      </div>
      <HistoryList histories={histories} onDelete={handleDelete} />
    </section>
  );
}
