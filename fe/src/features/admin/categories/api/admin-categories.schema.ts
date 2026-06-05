import { z } from "zod";

export const adminCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _count: z
    .object({
      comics: z.number(),
    })
    .optional(),
});

export const adminCategoryListSchema = z.array(adminCategorySchema);

export const createAdminCategoryInputSchema = z.object({
  name: z.string().min(1, "Vui long nhap ten the loai"),
  slug: z.string().min(1, "Vui long nhap slug"),
});

export const updateAdminCategoryInputSchema = createAdminCategoryInputSchema;

export const deleteAdminCategoryResultSchema = adminCategorySchema;

export type AdminCategory = z.infer<typeof adminCategorySchema>;
export type CreateAdminCategoryInput = z.infer<
  typeof createAdminCategoryInputSchema
>;
export type UpdateAdminCategoryInput = z.infer<
  typeof updateAdminCategoryInputSchema
>;
export type DeleteAdminCategoryResult = z.infer<
  typeof deleteAdminCategoryResultSchema
>;
