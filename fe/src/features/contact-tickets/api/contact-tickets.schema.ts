import { z } from "zod";
import { paginationMetaSchema } from "@/shared/api/api-response.schema";

export const contactTicketTypeSchema = z.enum([
  "TECHNICAL",
  "PAYMENT",
  "COPYRIGHT",
  "ACCOUNT",
  "OTHER",
]);

export const contactTicketStatusSchema = z.enum([
  "NEW",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);

export const createContactTicketInputSchema = z.object({
  type: contactTicketTypeSchema,
  name: z.string().max(100).optional(),
  email: z.email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
  relatedUrl: z.string().max(500).optional(),
  orderCode: z.string().max(100).optional(),
});

export const contactTicketUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().nullable().optional(),
});

export const contactTicketSchema = z.object({
  id: z.number(),
  userId: z.number().nullable().optional(),
  type: contactTicketTypeSchema,
  status: contactTicketStatusSchema,
  name: z.string().nullable().optional(),
  email: z.string(),
  subject: z.string(),
  message: z.string(),
  relatedUrl: z.string().nullable().optional(),
  orderCode: z.string().nullable().optional(),
  adminNote: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  resolvedAt: z.string().nullable().optional(),
  closedAt: z.string().nullable().optional(),
  user: contactTicketUserSchema.nullable().optional(),
});

export const contactTicketsPaginatedSchema = z.object({
  items: z.array(contactTicketSchema),
  meta: paginationMetaSchema,
});

export const contactTicketsQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  type: contactTicketTypeSchema.optional(),
  status: contactTicketStatusSchema.optional(),
  email: z.string().optional(),
  userId: z.number().optional(),
  q: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const createContactTicketResultSchema = z.object({
  message: z.string(),
  ticket: contactTicketSchema,
});

export const updateContactTicketInputSchema = z.object({
  status: contactTicketStatusSchema.optional(),
  adminNote: z.string().max(5000).optional(),
});

export type ContactTicketType = z.infer<typeof contactTicketTypeSchema>;
export type ContactTicketStatus = z.infer<typeof contactTicketStatusSchema>;
export type CreateContactTicketInput = z.infer<
  typeof createContactTicketInputSchema
>;
export type ContactTicket = z.infer<typeof contactTicketSchema>;
export type ContactTicketsPaginated = z.infer<
  typeof contactTicketsPaginatedSchema
>;
export type ContactTicketsQuery = z.infer<typeof contactTicketsQuerySchema>;
export type CreateContactTicketResult = z.infer<
  typeof createContactTicketResultSchema
>;
export type UpdateContactTicketInput = z.infer<
  typeof updateContactTicketInputSchema
>;
