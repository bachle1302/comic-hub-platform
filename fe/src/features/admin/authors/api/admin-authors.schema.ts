import { z } from "zod";

export const adminAuthorSchema = z.object({
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

export const adminAuthorListSchema = z.array(adminAuthorSchema);

export const createAdminAuthorInputSchema = z.object({
  name: z.string().min(1, "Vui long nhap ten tac gia"),
  slug: z.string().min(1, "Vui long nhap slug"),
});

export const updateAdminAuthorInputSchema = createAdminAuthorInputSchema;

export const deleteAdminAuthorResultSchema = adminAuthorSchema;

export type AdminAuthor = z.infer<typeof adminAuthorSchema>;
export type CreateAdminAuthorInput = z.infer<
  typeof createAdminAuthorInputSchema
>;
export type UpdateAdminAuthorInput = z.infer<
  typeof updateAdminAuthorInputSchema
>;
export type DeleteAdminAuthorResult = z.infer<
  typeof deleteAdminAuthorResultSchema
>;
