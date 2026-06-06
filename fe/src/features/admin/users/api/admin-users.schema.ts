import { z } from "zod";
import { paginationMetaSchema } from "@/shared/api/api-response.schema";

export const adminUserRoleSchema = z.enum(["USER", "ADMIN"]);

const adminUserCountSchema = z
  .object({
    purchases: z.number().optional(),
    comments: z.number().optional(),
    follows: z.number().optional(),
    histories: z.number().optional(),
    transactions: z.number().optional(),
  })
  .optional();

export const adminTransactionSchema = z.object({
  id: z.number(),
  userId: z.number().optional(),
  amount: z.number(),
  orderId: z.string().nullable().optional(),
  type: z.string(),
  status: z.string(),
  balanceBefore: z.number().nullable().optional(),
  balanceAfter: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  createdAt: z.string(),
});

const adminUserPurchaseSchema = z.object({
  id: z.number(),
  price: z.number(),
  createdAt: z.string(),
  chapter: z
    .object({
      id: z.number(),
      name: z.string(),
      chapterNumber: z.number(),
      comic: z
        .object({
          id: z.number(),
          name: z.string(),
          slug: z.string(),
          thumbnail: z.string().nullable().optional(),
        })
        .optional(),
    })
    .optional(),
});

export const adminUserListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: adminUserRoleSchema,
  avatar: z.string().nullable().optional(),
  coin: z.number(),
  emailVerifiedAt: z.string().nullable().optional(),
  provider: z.string().optional(),
  googleId: z.string().nullable().optional(),
  bannedAt: z.string().nullable().optional(),
  banReason: z.string().nullable().optional(),
  hasGoogleLinked: z.boolean().optional(),
  isBanned: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _count: adminUserCountSchema,
});

export const adminUsersPaginatedSchema = z.object({
  items: z.array(adminUserListItemSchema),
  meta: paginationMetaSchema,
});

export const adminUsersQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  q: z.string().optional(),
  role: adminUserRoleSchema.optional(),
});

export const adminUserDetailSchema = adminUserListItemSchema.extend({
  purchases: z.array(adminUserPurchaseSchema).optional(),
  transactions: z.array(adminTransactionSchema).optional(),
  recentPurchases: z.array(adminUserPurchaseSchema).optional(),
  recentTransactions: z.array(adminTransactionSchema).optional(),
});

export const adminTransactionsPaginatedSchema = z.object({
  items: z.array(adminTransactionSchema),
  meta: paginationMetaSchema,
});

export const adjustUserCoinInputSchema = z.object({
  amount: z.number().int().refine((value) => value !== 0, {
    message: "Amount phai khac 0",
  }),
  reason: z.string().max(255, "Ly do toi da 255 ky tu").optional(),
});

export const adjustUserCoinResultSchema = z.object({
  user: z.object({
    id: z.number(),
    coin: z.number(),
  }),
  transaction: adminTransactionSchema,
});

export const banUserInputSchema = z.object({
  reason: z.string().max(500, "Ly do toi da 500 ky tu").optional(),
});

export const banUserResultSchema = adminUserDetailSchema;

export const unbanUserResultSchema = adminUserDetailSchema;

export type AdminUserListItem = z.infer<typeof adminUserListItemSchema>;
export type AdminUsersPaginated = z.infer<typeof adminUsersPaginatedSchema>;
export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;
export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>;
export type AdminTransaction = z.infer<typeof adminTransactionSchema>;
export type AdminTransactionsPaginated = z.infer<
  typeof adminTransactionsPaginatedSchema
>;
export type AdjustUserCoinInput = z.infer<typeof adjustUserCoinInputSchema>;
export type AdjustUserCoinResult = z.infer<typeof adjustUserCoinResultSchema>;
export type BanUserInput = z.infer<typeof banUserInputSchema>;
export type BanUserResult = z.infer<typeof banUserResultSchema>;
export type UnbanUserResult = z.infer<typeof unbanUserResultSchema>;
