"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AdminCoinPackage } from "../api/admin-coin-packages.schema";

type AdminCoinPackagesTableProps = {
  coinPackages: AdminCoinPackage[];
  deletingId?: number | null;
  onDelete: (id: number) => Promise<void> | void;
};

function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function AdminCoinPackagesTable({
  coinPackages,
  deletingId,
  onDelete,
}: AdminCoinPackagesTableProps) {
  if (coinPackages.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Chua co goi coin nao.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Coin</th>
              <th className="px-4 py-3 font-medium">Bonus</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Sort</th>
              <th className="px-4 py-3 text-right font-medium">Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {coinPackages.map((coinPackage) => {
              const totalCoin = coinPackage.coin + coinPackage.bonusCoin;

              return (
                <tr key={coinPackage.id} className="border-t align-top">
                  <td className="px-4 py-3 font-medium">
                    {coinPackage.name}
                  </td>
                  <td className="px-4 py-3">{coinPackage.coin}</td>
                  <td className="px-4 py-3">{coinPackage.bonusCoin}</td>
                  <td className="px-4 py-3 font-medium">{totalCoin}</td>
                  <td className="px-4 py-3">{formatVnd(coinPackage.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        coinPackage.isActive
                          ? "rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700"
                          : "rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {coinPackage.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{coinPackage.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/coin-packages/${coinPackage.id}`}>
                          Sua
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={
                          !coinPackage.isActive || deletingId === coinPackage.id
                        }
                        onClick={() => {
                          if (
                            window.confirm(
                              "Goi coin se bi tat va khong hien thi cho user. Tiep tuc?",
                            )
                          ) {
                            void onDelete(coinPackage.id);
                          }
                        }}
                      >
                        {!coinPackage.isActive
                          ? "Da tat"
                          : deletingId === coinPackage.id
                            ? "Dang tat..."
                            : "Tat"}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
