import { z } from "zod";

export const systemSettingValueTypeSchema = z.enum([
  "STRING",
  "NUMBER",
  "BOOLEAN",
  "JSON",
]);

export const systemSettingSchema = z.object({
  id: z.number(),
  key: z.string(),
  value: z.string(),
  valueType: systemSettingValueTypeSchema,
  group: z.string(),
  label: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isPublic: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const publicSystemSettingsSchema = z
  .object({
    general: z
      .object({
        siteName: z.string().optional(),
        siteDescription: z.string().optional(),
        logoUrl: z.string().optional(),
        supportEmail: z.string().optional(),
        contactEmail: z.string().optional(),
      })
      .passthrough()
      .optional(),
    seo: z
      .object({
        defaultTitle: z.string().optional(),
        defaultDescription: z.string().optional(),
      })
      .passthrough()
      .optional(),
    social: z
      .object({
        facebookUrl: z.string().optional(),
        discordUrl: z.string().optional(),
        telegramUrl: z.string().optional(),
      })
      .passthrough()
      .optional(),
    system: z
      .object({
        maintenanceMode: z.boolean().optional(),
        maintenanceMessage: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const adminSystemSettingsQuerySchema = z.object({
  group: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const updateSystemSettingInputSchema = z.object({
  value: z.unknown(),
});

export type SystemSettingValueType = z.infer<
  typeof systemSettingValueTypeSchema
>;
export type SystemSetting = z.infer<typeof systemSettingSchema>;
export type PublicSystemSettings = z.infer<typeof publicSystemSettingsSchema>;
export type AdminSystemSettingsQuery = z.infer<
  typeof adminSystemSettingsQuerySchema
>;
export type UpdateSystemSettingInput = z.infer<
  typeof updateSystemSettingInputSchema
>;

