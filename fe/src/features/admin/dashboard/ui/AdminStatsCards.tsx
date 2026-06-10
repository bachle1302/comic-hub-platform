"use client";

import type { AdminDashboardStats } from "../api/admin-dashboard.schema";
import { formatCompactNumber } from "@/shared/utils/format";

type AdminStatsCardsProps = {
  stats: AdminDashboardStats;
};

type StatCard = {
  description?: string;
  label: string;
  value: number;
};

function StatCardView({ description, label, value }: StatCard) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{formatCompactNumber(value)}</p>
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const cards: StatCard[] = [
    {
      label: "Người dùng",
      value: stats.users.total,
      description: `${stats.users.admins} quản trị viên`,
    },
    {
      label: "Truyện",
      value: stats.comics.total,
      description: `${stats.comics.public} công khai`,
    },
    {
      label: "Chương",
      value: stats.chapters.total,
      description: `${stats.chapters.free} miễn phí / ${stats.chapters.paid} tính phí`,
    },
    {
      label: "Bình luận",
      value: stats.comments.total,
    },
    {
      label: "Lượt theo dõi",
      value: stats.follows.total,
    },
    {
      label: "Lượt mua",
      value: stats.purchases.total,
      description: `${formatCompactNumber(stats.purchases.totalCoinSpent)} coin đã tiêu`,
    },
    {
      label: "Giao dịch",
      value: stats.transactions.total,
    },
    {
      label: "Tổng coin đã tiêu",
      value: stats.purchases.totalCoinSpent,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCardView key={card.label} {...card} />
      ))}
    </div>
  );
}
