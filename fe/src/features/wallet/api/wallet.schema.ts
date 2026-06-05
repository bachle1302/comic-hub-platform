import { z } from "zod";

export const walletSchema = z
  .object({
    coin: z.number(),
  })
  .passthrough();

export const transactionSchema = z.object({
  id: z.number(),
  amount: z.number(),
  type: z.string(),
  status: z.string(),
  balanceBefore: z.number().nullable().optional(),
  balanceAfter: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const transactionsSchema = z.array(transactionSchema);

export type Wallet = z.infer<typeof walletSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
