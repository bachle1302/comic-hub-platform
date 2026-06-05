"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AdjustUserCoinForm,
  AdminUserTransactionsTable,
  BanUserForm,
  getAdminUserDetail,
  getAdminUserTransactions,
  type AdminTransactionsPaginated,
  type AdminUserDetail as AdminUserDetailType,
} from "@/features/admin/users";
import { AdminUserDetail } from "@/features/admin/users/ui/AdminUserDetail";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const rawId = params.id;
  const userId = Number(rawId);
  const [user, setUser] = useState<AdminUserDetailType | null>(null);
  const [transactionsData, setTransactionsData] =
    useState<AdminTransactionsPaginated | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!Number.isFinite(userId) || userId <= 0) {
      setErrorMessage("User ID khong hop le");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [nextUser, nextTransactions] = await Promise.all([
        getAdminUserDetail(userId),
        getAdminUserTransactions(userId, {
          limit: 20,
          page: 1,
        }),
      ]);
      setUser(nextUser);
      setTransactionsData(nextTransactions);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Khong tai duoc user",
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadData]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Chi tiet nguoi dung</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem thong tin, coin va transaction cua user.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/users">Quay lai users</Link>
        </Button>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Dang tai user...
        </div>
      ) : user ? (
        <>
          <AdminUserDetail user={user} />
          <AdjustUserCoinForm
            currentCoin={user.coin}
            userId={user.id}
            onAdjusted={loadData}
          />
          <BanUserForm
            banReason={user.banReason}
            bannedAt={user.bannedAt}
            isBanned={Boolean(user.bannedAt)}
            userId={user.id}
            onChanged={loadData}
          />

          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Transactions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Lich su giao dich gan day cua user.
              </p>
            </div>
            <AdminUserTransactionsTable
              transactions={transactionsData?.items ?? []}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}
