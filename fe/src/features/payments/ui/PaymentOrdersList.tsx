"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/ui";
import type { PaymentOrder } from "../api/payments.schema";

type PaymentOrdersListProps = {
  orders: PaymentOrder[];
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency",
  }).format(value);
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusLabel(status: PaymentOrder["status"]): string {
  switch (status) {
    case "PENDING":
      return "Dang cho";
    case "PAID":
      return "Da thanh toan";
    case "CANCELLED":
      return "Da huy";
    case "EXPIRED":
      return "Het han";
    case "FAILED":
      return "That bai";
  }
}

function getStatusClassName(status: PaymentOrder["status"]): string {
  switch (status) {
    case "PAID":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "PENDING":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "CANCELLED":
    case "EXPIRED":
    case "FAILED":
      return "border-destructive/30 bg-destructive/10 text-destructive";
  }
}

export function PaymentOrdersList({ orders }: PaymentOrdersListProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="Chua co don nap coin"
        description="Cac don nap coin cua ban se hien tai day."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-muted/60 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Ma don</th>
            <th className="px-4 py-3 font-medium">Trang thai</th>
            <th className="px-4 py-3 font-medium">So tien</th>
            <th className="px-4 py-3 font-medium">Coin</th>
            <th className="px-4 py-3 font-medium">Tao luc</th>
            <th className="px-4 py-3 font-medium">Thanh toan luc</th>
            <th className="px-4 py-3 font-medium">Hanh dong</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t">
              <td className="px-4 py-3 font-mono text-xs">{order.orderCode}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusClassName(
                    order.status,
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </td>
              <td className="px-4 py-3">{formatCurrency(order.amount)}</td>
              <td className="px-4 py-3">{order.totalCoin} coin</td>
              <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
              <td className="px-4 py-3">{formatDate(order.paidAt)}</td>
              <td className="px-4 py-3">
                {order.status === "PENDING" && order.checkoutUrl ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      window.location.href = order.checkoutUrl ?? "";
                    }}
                  >
                    Tiep tuc thanh toan
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
