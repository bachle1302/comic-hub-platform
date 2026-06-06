"use client";

import { Button } from "@/components/ui/button";
import { AdminLink } from "@/shared/ui/AdminLink";
import type {
  ContactTicket,
  ContactTicketStatus,
  ContactTicketType,
} from "../api/contact-tickets.schema";

type AdminContactTicketsTableProps = {
  tickets: ContactTicket[];
};

const statusLabels: Record<ContactTicketStatus, string> = {
  NEW: "Moi",
  IN_PROGRESS: "Dang xu ly",
  RESOLVED: "Da xu ly",
  CLOSED: "Da dong",
};

const typeLabels: Record<ContactTicketType, string> = {
  TECHNICAL: "Ky thuat",
  PAYMENT: "Thanh toan",
  COPYRIGHT: "Ban quyen",
  ACCOUNT: "Tai khoan",
  OTHER: "Khac",
};

const statusClassNames: Record<ContactTicketStatus, string> = {
  NEW: "bg-amber-500/10 text-amber-700",
  IN_PROGRESS: "bg-blue-500/10 text-blue-700",
  RESOLVED: "bg-emerald-500/10 text-emerald-700",
  CLOSED: "bg-muted text-muted-foreground",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminContactTicketsTable({
  tickets,
}: AdminContactTicketsTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Khong co yeu cau ho tro nao.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Ngay tao</th>
              <th className="px-4 py-3 text-right font-medium">Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-t align-top">
                <td className="px-4 py-3">#{ticket.id}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusClassNames[ticket.status]}`}
                  >
                    {statusLabels[ticket.status]}
                  </span>
                </td>
                <td className="px-4 py-3">{typeLabels[ticket.type]}</td>
                <td className="max-w-sm px-4 py-3">
                  <p className="line-clamp-2 font-medium">{ticket.subject}</p>
                  {ticket.relatedUrl ? (
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {ticket.relatedUrl}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">{ticket.email}</td>
                <td className="px-4 py-3">
                  {ticket.orderCode ? (
                    ticket.orderCode
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3">{formatDate(ticket.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Button asChild size="sm" variant="outline">
                      <AdminLink href={`/admin/contact-tickets/${ticket.id}`}>
                        Chi tiet
                      </AdminLink>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
