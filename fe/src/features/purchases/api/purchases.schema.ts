import { z } from "zod";

const purchaseSchema = z
  .object({
    id: z.number().optional(),
    price: z.number().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough();

const purchaseTransactionSchema = z
  .object({
    id: z.number().optional(),
    amount: z.number().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    balanceBefore: z.number().nullable().optional(),
    balanceAfter: z.number().nullable().optional(),
    description: z.string().nullable().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough();

export const purchaseChapterResultSchema = z
  .object({
    purchase: purchaseSchema.nullable().optional(),
    user: z.object({
      id: z.number(),
      coin: z.number(),
    }),
    transaction: purchaseTransactionSchema.nullable().optional(),
  })
  .passthrough();

export const chapterAccessSchema = z.object({
  hasAccess: z.boolean(),
  isFree: z.boolean(),
  isPurchased: z.boolean(),
  price: z.number(),
});

export const myPurchaseSchema = z.object({
  id: z.number(),
  price: z.number(),
  createdAt: z.string(),
  chapter: z.object({
    id: z.number(),
    name: z.string(),
    chapterNumber: z.number(),
    comic: z.object({
      id: z.number(),
      name: z.string(),
      slug: z.string(),
      thumbnail: z.string().nullable().optional(),
    }),
  }),
});

export const myPurchasesSchema = z.array(myPurchaseSchema);

export type PurchaseChapterResult = z.infer<
  typeof purchaseChapterResultSchema
>;
export type ChapterAccess = z.infer<typeof chapterAccessSchema>;
export type MyPurchase = z.infer<typeof myPurchaseSchema>;
