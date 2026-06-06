"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AdminCoinPackagesFilter,
  AdminCoinPackagesTable,
  deleteAdminCoinPackage,
  getAdminCoinPackages,
  type AdminCoinPackagesPaginated,
  type AdminCoinPackagesQuery,
} from "@/features/admin/coin-packages";
import { areShallowObjectsEqual } from "@/shared/utils/object";

const DEFAULT_QUERY: AdminCoinPackagesQuery = {
  limit: 20,
  page: 1,
};

export default function AdminCoinPackagesPage() {
  const [data, setData] = useState<AdminCoinPackagesPaginated | null>(null);
  const [query, setQuery] = useState<AdminCoinPackagesQuery>(DEFAULT_QUERY);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCoinPackages = useCallback(
    async (nextQuery: AdminCoinPackagesQuery) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        setData(await getAdminCoinPackages(nextQuery));
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Khong tai duoc goi coin",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadCoinPackages(query);
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadCoinPackages, query]);

  function handleFilterChange(nextQuery: AdminCoinPackagesQuery) {
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

  async function handleDelete(id: number) {
    setDeletingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteAdminCoinPackage(id);
      setSuccessMessage("Da tat goi coin.");
      setData((currentData) => {
        if (!currentData) {
          return currentData;
        }

        if (query.isActive === true) {
          return {
            ...currentData,
            items: currentData.items.filter((coinPackage) => coinPackage.id !== id),
          };
        }

        return {
          ...currentData,
          items: currentData.items.map((coinPackage) =>
            coinPackage.id === id
              ? { ...coinPackage, isActive: false }
              : coinPackage,
          ),
        };
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Tat goi coin that bai",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Goi coin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quan ly cac goi nap coin hien thi tren vi user.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coin-packages/new">Tao goi coin</Link>
        </Button>
      </div>

      <AdminCoinPackagesFilter
        initialQuery={query}
        onChange={handleFilterChange}
      />

      {successMessage ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Dang tai goi coin...
        </div>
      ) : data ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Tong {data.meta.total} goi coin</span>
            <span>
              Trang {data.meta.page}/{data.meta.totalPages || 1}
            </span>
          </div>

          <AdminCoinPackagesTable
            coinPackages={data.items}
            deletingId={deletingId}
            onDelete={handleDelete}
          />

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
