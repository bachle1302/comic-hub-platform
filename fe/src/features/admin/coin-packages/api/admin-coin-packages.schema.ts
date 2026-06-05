import { z } from "zod";
import { paginationMetaSchema } from "@/shared/api/api-response.schema";

export const adminCoinPackageSchema = z.object({
  id: z.number(),
  name: z.string(),
  coin: z.number(),
  bonusCoin: z.number(),
  price: z.number(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _count: z
    .object({
      orders: z.number().optional(),
    })
    .optional(),
});

export const createAdminCoinPackageInputSchema = z.object({
  name: z.string().min(2).max(100),
  coin: z.number().int().min(1),
  bonusCoin: z.number().int().min(0).optional().default(0),
  price: z.number().int().min(1000),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export const updateAdminCoinPackageInputSchema =
  createAdminCoinPackageInputSchema.partial();

export const adminCoinPackagesPaginatedSchema = z.object({
  items: z.array(adminCoinPackageSchema),
  meta: paginationMetaSchema,
});

export const adminCoinPackagesQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  q: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const deleteAdminCoinPackageResultSchema = z.object({
  message: z.string(),
});

export type AdminCoinPackage = z.infer<typeof adminCoinPackageSchema>;
export type CreateAdminCoinPackageInput = z.infer<
  typeof createAdminCoinPackageInputSchema
>;
export type UpdateAdminCoinPackageInput = z.infer<
  typeof updateAdminCoinPackageInputSchema
>;
export type AdminCoinPackagesPaginated = z.infer<
  typeof adminCoinPackagesPaginatedSchema
>;
export type AdminCoinPackagesQuery = z.infer<
  typeof adminCoinPackagesQuerySchema
>;
export type DeleteAdminCoinPackageResult = z.infer<
  typeof deleteAdminCoinPackageResultSchema
>;
