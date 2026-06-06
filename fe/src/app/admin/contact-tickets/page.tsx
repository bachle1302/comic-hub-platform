"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AdminContactTicketsFilter,
  AdminContactTicketsTable,
  getAdminContactTickets,
  type ContactTicketsPaginated,
  type ContactTicketsQuery,
} from "@/features/contact-tickets";
import { areShallowObjectsEqual } from "@/shared/utils/object";

const DEFAULT_QUERY: ContactTicketsQuery = {
  limit: 20,
  page: 1,
};

export default function AdminContactTicketsPage() {
  const [data, setData] = useState<ContactTicketsPaginated | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState<ContactTicketsQuery>(DEFAULT_QUERY);

  const loadTickets = useCallback(async (nextQuery: ContactTicketsQuery) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setData(await getAdminContactTickets(nextQuery));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Khong tai duoc tickets",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadTickets(query);
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadTickets, query]);

  function handleFilterChange(nextQuery: ContactTicketsQuery) {
    const normalizedQuery = {
      ...nextQuery,
      limit: nextQuery.limit ?? 20,
      page: 1,
    };

    setQuery((currentQuery) =>
      areShallowObjectsEqual(currentQuery, normalizedQuery)
        ? currentQuery
        : normalizedQuery,
    );
  }

  function handlePageChange(page: number) {
    setQuery((currentQuery) => ({
      ...currentQuery,
      page,
    }));
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Yeu cau ho tro</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xem, loc va xu ly ticket lien he tu nguoi dung.
        </p>
      </div>

      <AdminContactTicketsFilter
        initialQuery={query}
        onChange={handleFilterChange}
      />

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Dang tai yeu cau ho tro...
        </div>
      ) : data ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Tong {data.meta.total} ticket</span>
            <span>
              Trang {data.meta.page}/{data.meta.totalPages || 1}
            </span>
          </div>

          <AdminContactTicketsTable tickets={data.items} />

          {data.meta.totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!data.meta.hasPreviousPage || isLoading}
                onClick={() => handlePageChange((query.page ?? 1) - 1)}
              >
                Trang truoc
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {data.meta.page}/{data.meta.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!data.meta.hasNextPage || isLoading}
                onClick={() => handlePageChange((query.page ?? 1) + 1)}
              >
                Trang sau
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
