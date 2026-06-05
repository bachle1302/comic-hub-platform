import { z } from "zod";
import { paginationMetaSchema } from "@/shared/api/api-response.schema";

export const announcementTypeSchema = z.enum([
  "INFO",
  "SUCCESS",
  "WARNING",
  "DANGER",
  "PROMOTION",
]);

export const announcementTargetSchema = z.enum([
  "ALL",
  "AUTHENTICATED",
  "GUEST",
]);

export const announcementSchema = z.object({
  id: z.number(),
  title: z.string(),
  message: z.string(),
  type: announcementTypeSchema,
  target: announcementTargetSchema,
  linkUrl: z.string().nullable().optional(),
  linkLabel: z.string().nullable().optional(),
  isActive: z.boolean(),
  priority: z.number(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const announcementInputBaseSchema = z.object({
  title: z.string().min(3).max(200),
  message: z.string().min(3).max(2000),
  type: announcementTypeSchema.optional(),
  target: announcementTargetSchema.optional(),
  linkUrl: z.string().max(500).optional(),
  linkLabel: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

function validateDateRange(
  value: { endsAt?: string; startsAt?: string },
  context: z.RefinementCtx,
) {
  if (!value.startsAt || !value.endsAt) {
    return;
  }

  if (new Date(value.startsAt).getTime() > new Date(value.endsAt).getTime()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Thoi gian bat dau phai truoc thoi gian ket thuc",
      path: ["endsAt"],
    });
  }
}

export const announcementInputSchema = announcementInputBaseSchema.superRefine(
  validateDateRange,
);

export const updateAnnouncementInputSchema = announcementInputBaseSchema
  .partial()
  .superRefine(validateDateRange);

export const announcementsPaginatedSchema = z.object({
  items: z.array(announcementSchema),
  meta: paginationMetaSchema,
});

export const adminAnnouncementsQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  q: z.string().optional(),
  type: announcementTypeSchema.optional(),
  target: announcementTargetSchema.optional(),
  isActive: z.boolean().optional(),
});

export const activeAnnouncementsQuerySchema = z.object({
  limit: z.number().optional(),
  target: announcementTargetSchema.optional(),
});

export const deleteAnnouncementResultSchema = z.object({
  message: z.string(),
});

export const broadcastAnnouncementResultSchema = z.object({
  createdCount: z.number(),
  target: z.string(),
});

export type Announcement = z.infer<typeof announcementSchema>;
export type AnnouncementInput = z.infer<typeof announcementInputSchema>;
export type UpdateAnnouncementInput = z.infer<
  typeof updateAnnouncementInputSchema
>;
export type AnnouncementsPaginated = z.infer<
  typeof announcementsPaginatedSchema
>;
export type AdminAnnouncementsQuery = z.infer<
  typeof adminAnnouncementsQuerySchema
>;
export type ActiveAnnouncementsQuery = z.infer<
  typeof activeAnnouncementsQuerySchema
>;
export type DeleteAnnouncementResult = z.infer<
  typeof deleteAnnouncementResultSchema
>;
export type BroadcastAnnouncementResult = z.infer<
  typeof broadcastAnnouncementResultSchema
>;
