import { z } from "zod";
import { paginationMetaSchema } from "@/shared/api/api-response.schema";

export const coinPackageSchema = z.object({
  id: z.number(),
  name: z.string(),
  coin: z.number(),
  bonusCoin: z.number().optional().default(0),
  totalCoin: z.number().optional(),
  price: z.number(),
  isActive: z.boolean().optional(),
});

export const createPaymentOrderInputSchema = z.object({
  coinPackageId: z.number(),
});

export const paymentOrderStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "CANCELLED",
  "EXPIRED",
  "FAILED",
]);

export const paymentOrderSchema = z.object({
  id: z.number(),
  orderCode: z.string(),
  status: paymentOrderStatusSchema,
  amount: z.number(),
  coin: z.number(),
  bonusCoin: z.number(),
  totalCoin: z.number(),
  checkoutUrl: z.string().nullable().optional(),
  createdAt: z.string(),
  paidAt: z.string().nullable().optional(),
});

export const createPaymentOrderResultSchema = z.object({
  order: paymentOrderSchema,
  checkoutUrl: z.string(),
});

export const paymentOrdersQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
});

export const paymentOrdersPaginatedSchema = z.object({
  items: z.array(paymentOrderSchema),
  meta: paginationMetaSchema,
});

export type CoinPackage = z.infer<typeof coinPackageSchema>;
export type CreatePaymentOrderInput = z.infer<
  typeof createPaymentOrderInputSchema
>;
export type CreatePaymentOrderResult = z.infer<
  typeof createPaymentOrderResultSchema
>;
export type PaymentOrder = z.infer<typeof paymentOrderSchema>;
export type PaymentOrdersPaginated = z.infer<
  typeof paymentOrdersPaginatedSchema
>;
export type PaymentOrdersQuery = z.infer<typeof paymentOrdersQuerySchema>;
