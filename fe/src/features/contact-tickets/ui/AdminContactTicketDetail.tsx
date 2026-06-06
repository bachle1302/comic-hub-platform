"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { AdminLink } from "@/shared/ui/AdminLink";
import {
  contactTicketStatusSchema,
  updateContactTicketInputSchema,
  type ContactTicket,
  type ContactTicketStatus,
  type UpdateContactTicketInput,
} from "../api/contact-tickets.schema";
import { updateAdminContactTicket } from "../api/contact-tickets.api";

type AdminContactTicketDetailProps = {
  onUpdated?: (ticket: ContactTicket) => Promise<void> | void;
  ticket: ContactTicket;
};

const statusLabels: Record<ContactTicketStatus, string> = {
  NEW: "Moi",
  IN_PROGRESS: "Dang xu ly",
  RESOLVED: "Da xu ly",
  CLOSED: "Da dong",
};

function formatDate(value?: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function AdminContactTicketDetail({
  onUpdated,
  ticket,
}: AdminContactTicketDetailProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<UpdateContactTicketInput>({
    resolver: zodResolver(updateContactTicketInputSchema),
    defaultValues: {
      status: ticket.status,
      adminNote: ticket.adminNote ?? "",
    },
  });

  useEffect(() => {
    reset({
      status: ticket.status,
      adminNote: ticket.adminNote ?? "",
    });
  }, [reset, ticket.adminNote, ticket.status]);

  async function submit(input: UpdateContactTicketInput) {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updatedTicket = await updateAdminContactTicket(ticket.id, {
        status: input.status,
        adminNote: input.adminNote?.trim() || undefined,
      });
      setSuccessMessage("Da luu thay doi ticket.");
      await onUpdated?.(updatedTicket);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Cap nhat ticket that bai",
      );
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="space-y-4 rounded-lg border bg-card p-4">
        <div>
          <h2 className="text-xl font-semibold">{ticket.subject}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ticket #{ticket.id} - {statusLabels[ticket.status]}
          </p>
        </div>

        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="font-medium">Email</dt>
            <dd className="mt-1 text-muted-foreground">{ticket.email}</dd>
          </div>
          <div>
            <dt className="font-medium">Ten</dt>
            <dd className="mt-1 text-muted-foreground">
              {ticket.name || "-"}
            </dd>
          </div>
          <div>
            <dt className="font-medium">User ID</dt>
            <dd className="mt-1 text-muted-foreground">
              {ticket.userId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Order code</dt>
            <dd className="mt-1 text-muted-foreground">
              {ticket.orderCode || "-"}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Created</dt>
            <dd className="mt-1 text-muted-foreground">
              {formatDate(ticket.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Updated</dt>
            <dd className="mt-1 text-muted-foreground">
              {formatDate(ticket.updatedAt)}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Resolved</dt>
            <dd className="mt-1 text-muted-foreground">
              {formatDate(ticket.resolvedAt)}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Closed</dt>
            <dd className="mt-1 text-muted-foreground">
              {formatDate(ticket.closedAt)}
            </dd>
          </div>
        </dl>

        {ticket.relatedUrl ? (
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <p className="font-medium">Related URL</p>
            {isHttpUrl(ticket.relatedUrl) ? (
              <a
                href={ticket.relatedUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block break-all text-primary underline"
              >
                {ticket.relatedUrl}
              </a>
            ) : (
              <AdminLink
                href={ticket.relatedUrl}
                className="mt-1 block break-all text-primary underline"
              >
                {ticket.relatedUrl}
              </AdminLink>
            )}
          </div>
        ) : null}

        <div>
          <h3 className="font-semibold">Message</h3>
          <p className="mt-2 whitespace-pre-line rounded-md border bg-background p-3 text-sm">
            {ticket.message}
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSubmit(submit)}
        className="space-y-4 rounded-lg border bg-card p-4"
      >
        <div>
          <h2 className="text-lg font-semibold">Xu ly ticket</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cap nhat trang thai va ghi chu noi bo cho yeu cau nay.
          </p>
        </div>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Status</span>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
            {...register("status")}
          >
            {contactTicketStatusSchema.options.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
          {errors.status ? (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Admin note</span>
          <textarea
            rows={8}
            className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:border-primary"
            placeholder="Ghi chu noi bo"
            {...register("adminNote")}
          />
          {errors.adminNote ? (
            <p className="text-sm text-destructive">
              {errors.adminNote.message}
            </p>
          ) : null}
        </label>

        {successMessage ? (
          <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Dang luu..." : "Luu thay doi"}
        </Button>
      </form>
    </div>
  );
}
