import {
  clientApiGet,
  clientApiPatch,
  clientApiPost,
} from "@/shared/api/client-api";
import {
  contactTicketSchema,
  contactTicketsPaginatedSchema,
  createContactTicketResultSchema,
  type ContactTicket,
  type ContactTicketsPaginated,
  type ContactTicketsQuery,
  type CreateContactTicketInput,
  type CreateContactTicketResult,
  type UpdateContactTicketInput,
} from "./contact-tickets.schema";

function buildQueryString(query?: ContactTicketsQuery): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }

  if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }

  if (query.type !== undefined) {
    params.set("type", query.type);
  }

  if (query.status !== undefined) {
    params.set("status", query.status);
  }

  if (query.email?.trim()) {
    params.set("email", query.email.trim());
  }

  if (query.userId !== undefined) {
    params.set("userId", String(query.userId));
  }

  if (query.q?.trim()) {
    params.set("q", query.q.trim());
  }

  if (query.dateFrom !== undefined) {
    params.set("dateFrom", query.dateFrom);
  }

  if (query.dateTo !== undefined) {
    params.set("dateTo", query.dateTo);
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function createContactTicket(
  input: CreateContactTicketInput,
): Promise<CreateContactTicketResult> {
  return clientApiPost(
    "/contact-tickets",
    createContactTicketResultSchema,
    input,
  );
}

export function getAdminContactTickets(
  query?: ContactTicketsQuery,
): Promise<ContactTicketsPaginated> {
  return clientApiGet(
    `/admin/contact-tickets${buildQueryString(query)}`,
    contactTicketsPaginatedSchema,
    {
      auth: true,
    },
  );
}

export function getAdminContactTicket(id: number): Promise<ContactTicket> {
  return clientApiGet(`/admin/contact-tickets/${id}`, contactTicketSchema, {
    auth: true,
  });
}

export function updateAdminContactTicket(
  id: number,
  input: UpdateContactTicketInput,
): Promise<ContactTicket> {
  return clientApiPatch(`/admin/contact-tickets/${id}`, contactTicketSchema, input, {
    auth: true,
  });
}
