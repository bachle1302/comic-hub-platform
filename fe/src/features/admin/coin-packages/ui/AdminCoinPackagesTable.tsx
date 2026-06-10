"use client";

import { Button } from "@/components/ui/button";
import { AdminLink } from "@/shared/ui/AdminLink";
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
        Chưa có gói coin nào.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Tên gói</th>
              <th className="px-4 py-3 font-medium">Coin</th>
              <th className="px-4 py-3 font-medium">Thưởng</th>
              <th className="px-4 py-3 font-medium">Tổng</th>
              <th className="px-4 py-3 font-medium">Giá</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Sắp xếp</th>
              <th className="px-4 py-3 text-right font-medium">Thao tác</th>
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
                      {coinPackage.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{coinPackage.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <AdminLink href={`/admin/coin-packages/${coinPackage.id}`}>
                          Sửa
                        </AdminLink>
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
                              "Gói coin sẽ bị tắt và không hiển thị cho người dùng. Tiếp tục?",
                            )
                          ) {
                            void onDelete(coinPackage.id);
                          }
                        }}
                      >
                        {!coinPackage.isActive
                          ? "Đã tắt"
                          : deletingId === coinPackage.id
                            ? "Đang tắt..."
                            : "Tắt"}
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
