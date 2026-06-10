"use client";

import { formatDate } from "@/shared/utils/format";
import type { AdminTransaction } from "../api/admin-users.schema";

type AdminUserTransactionsTableProps = {
  transactions: AdminTransaction[];
};

function formatNullableNumber(value?: number | null): string {
  return value === undefined || value === null ? "-" : String(value);
}

const typeLabels: Record<string, string> = {
  DEPOSIT: "Nạp coin",
  SPEND: "Tiêu coin",
  ADJUST: "Điều chỉnh",
  REFUND: "Hoàn coin",
};

const statusLabels: Record<string, string> = {
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  PENDING: "Đang chờ",
};

export function AdminUserTransactionsTable({
  transactions,
}: AdminUserTransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Người dùng này chưa có giao dịch.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Số coin</th>
              <th className="px-4 py-3 font-medium">Loại giao dịch</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Trước</th>
              <th className="px-4 py-3 font-medium">Sau</th>
              <th className="px-4 py-3 font-medium">Mô tả</th>
              <th className="px-4 py-3 font-medium">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-t">
                <td className="px-4 py-3">{transaction.id}</td>
                <td
                  className={
                    transaction.amount < 0
                      ? "px-4 py-3 font-semibold text-destructive"
                      : "px-4 py-3 font-semibold text-green-600"
                  }
                >
                  {transaction.amount}
                </td>
                <td className="px-4 py-3">
                  {typeLabels[transaction.type] ?? transaction.type}
                </td>
                <td className="px-4 py-3">
                  {statusLabels[transaction.status] ?? transaction.status}
                </td>
                <td className="px-4 py-3">
                  {formatNullableNumber(transaction.balanceBefore)}
                </td>
                <td className="px-4 py-3">
                  {formatNullableNumber(transaction.balanceAfter)}
                </td>
                <td className="max-w-[260px] px-4 py-3 text-muted-foreground">
                  <span className="line-clamp-2">
                    {transaction.description ?? "-"}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(transaction.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
