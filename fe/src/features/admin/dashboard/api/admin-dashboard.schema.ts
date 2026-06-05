import { z } from "zod";

export const adminDashboardStatsSchema = z.object({
  users: z.object({
    total: z.number(),
    admins: z.number(),
  }),
  comics: z.object({
    total: z.number(),
    public: z.number(),
  }),
  chapters: z.object({
    total: z.number(),
    public: z.number(),
    paid: z.number(),
    free: z.number(),
  }),
  comments: z.object({
    total: z.number(),
  }),
  follows: z.object({
    total: z.number(),
  }),
  purchases: z.object({
    total: z.number(),
    totalCoinSpent: z.number(),
  }),
  transactions: z.object({
    total: z.number(),
  }),
});

export type AdminDashboardStats = z.infer<typeof adminDashboardStatsSchema>;
