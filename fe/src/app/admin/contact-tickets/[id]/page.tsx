"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AdminContactTicketDetail,
  getAdminContactTicket,
  type ContactTicket,
} from "@/features/contact-tickets";

export default function AdminContactTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const ticketId = Number(params.id);
  const [ticket, setTicket] = useState<ContactTicket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTicket = useCallback(async () => {
    if (!Number.isFinite(ticketId) || ticketId <= 0) {
      setErrorMessage("Ticket ID khong hop le");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      setTicket(await getAdminContactTicket(ticketId));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Khong tai duoc ticket",
      );
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadTicket();
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadTicket]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Chi tiet yeu cau ho tro</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem noi dung ticket va cap nhat trang thai xu ly.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/contact-tickets">Quay lai tickets</Link>
        </Button>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Dang tai ticket...
        </div>
      ) : ticket ? (
        <AdminContactTicketDetail ticket={ticket} onUpdated={setTicket} />
      ) : null}
    </section>
  );
}
