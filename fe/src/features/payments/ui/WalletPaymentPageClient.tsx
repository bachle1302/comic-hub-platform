"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import {
  getTransactions,
  getWallet,
  type Transaction,
  type Wallet,
} from "@/features/wallet";
import { PageContainer } from "@/shared/ui/PageContainer";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import {
  CoinPackageList,
  PaymentOrdersList,
  createPaymentOrder,
  getCoinPackages,
  getMyPaymentOrders,
  type CoinPackage,
  type PaymentOrder,
} from "@/features/payments";

type WalletPaymentPageClientProps = {
  paymentStatus?: string;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function WalletPaymentPageClient({
  paymentStatus,
}: WalletPaymentPageClientProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingPackageId, setPendingPackageId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadWalletData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [nextWallet, nextPackages, nextTransactions, nextPaymentOrders] =
        await Promise.all([
          getWallet(),
          getCoinPackages(),
          getTransactions(),
          getMyPaymentOrders({
            page: 1,
            limit: 10,
          }),
        ]);

      setWallet(nextWallet);
      setCoinPackages(nextPackages);
      setTransactions(nextTransactions.slice(0, 10));
      setPaymentOrders(nextPaymentOrders.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không tải được dữ liệu ví",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login?next=/me/wallet");
      return;
    }

    const task = window.setTimeout(() => {
      void loadWalletData();
    }, 0);

    return () => window.clearTimeout(task);
  }, [isAuthenticated, isAuthLoading, loadWalletData, router]);

  async function handleSelectPackage(coinPackageId: number) {
    setPendingPackageId(coinPackageId);
    setErrorMessage(null);

    try {
      const result = await createPaymentOrder({
        coinPackageId,
      });
      window.location.href = result.checkoutUrl;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không tạo được đơn thanh toán",
      );
      setPendingPackageId(null);
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
      <SectionHeader
        title="Ví Coin"
        description="Nạp coin, xem số dư và lịch sử giao dịch của bạn."
        action={
          <Button type="button" variant="outline" onClick={() => void loadWalletData()}>
            Làm mới
          </Button>
        }
      />

      {paymentStatus === "success" ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
          Thanh toán đang được xử lý. Coin sẽ được cộng sau khi hệ thống xác
          nhận.
        </div>
      ) : null}

      {paymentStatus === "cancel" ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
          Bạn đã hủy thanh toán.
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Số dư hiện tại</p>
          <p className="mt-2 text-3xl font-bold">
            {isLoading ? "..." : formatCurrency(wallet?.coin ?? 0)}
          </p>
          <p className="text-sm text-muted-foreground">coin</p>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Gói nạp coin</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Chọn gói coin, hệ thống sẽ chuyển bạn sang trang thanh toán PayOS.
          </p>
          <div className="mt-4">
            <CoinPackageList
              coinPackages={coinPackages}
              isLoading={isLoading}
              pendingPackageId={pendingPackageId}
              onSelect={handleSelectPackage}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Đơn nạp coin gần đây</h2>
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        ) : (
          <PaymentOrdersList orders={paymentOrders} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Giao dịch gần đây</h2>
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        ) : transactions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Chưa có giao dịch nào.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Loại</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Số coin</th>
                  <th className="px-4 py-3 font-medium">Sau giao dịch</th>
                  <th className="px-4 py-3 font-medium">Thời gian</th>
                  <th className="px-4 py-3 font-medium">Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t">
                    <td className="px-4 py-3">{transaction.type}</td>
                    <td className="px-4 py-3">{transaction.status}</td>
                    <td className="px-4 py-3 font-medium">
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </td>
                    <td className="px-4 py-3">
                      {transaction.balanceAfter ?? "-"}
                    </td>
                    <td className="px-4 py-3">{formatDate(transaction.createdAt)}</td>
                    <td className="px-4 py-3">
                      {transaction.description ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
