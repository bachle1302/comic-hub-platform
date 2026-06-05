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
      label: "Users",
      value: stats.users.total,
      description: `${stats.users.admins} admin`,
    },
    {
      label: "Comics",
      value: stats.comics.total,
      description: `${stats.comics.public} public`,
    },
    {
      label: "Chapters",
      value: stats.chapters.total,
      description: `${stats.chapters.free} free / ${stats.chapters.paid} paid`,
    },
    {
      label: "Comments",
      value: stats.comments.total,
    },
    {
      label: "Follows",
      value: stats.follows.total,
    },
    {
      label: "Purchases",
      value: stats.purchases.total,
      description: `${formatCompactNumber(stats.purchases.totalCoinSpent)} coin spent`,
    },
    {
      label: "Transactions",
      value: stats.transactions.total,
    },
    {
      label: "Total coin spent",
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
