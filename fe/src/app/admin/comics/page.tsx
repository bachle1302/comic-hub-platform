"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminAuthor } from "@/features/admin/authors";
import { getAdminAuthors } from "@/features/admin/authors";
import type { AdminCategory } from "@/features/admin/categories";
import { getAdminCategories } from "@/features/admin/categories";
import {
  AdminComicForm,
  AdminComicsTable,
  createAdminComic,
  deleteAdminComic,
  getAdminComics,
  updateAdminComic,
  type AdminComic,
  type AdminComicsQuery,
  type CreateAdminComicInput,
} from "@/features/admin/comics";

type DeletedFilter = NonNullable<AdminComicsQuery["deleted"]>;

export default function AdminComicsPage() {
  const [authors, setAuthors] = useState<AdminAuthor[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [comics, setComics] = useState<AdminComic[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingComic, setEditingComic] = useState<AdminComic | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletedFilter, setDeletedFilter] = useState<DeletedFilter>("active");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async (deleted: DeletedFilter) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [nextComics, nextAuthors, nextCategories] = await Promise.all([
        getAdminComics({ deleted }),
        getAdminAuthors(),
        getAdminCategories(),
      ]);

      setComics(nextComics);
      setAuthors(nextAuthors);
      setCategories(nextCategories);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Khong tai duoc du lieu admin",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reloadComics = useCallback(async () => {
    setComics(await getAdminComics({ deleted: deletedFilter }));
  }, [deletedFilter]);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadData(deletedFilter);
    }, 0);

    return () => window.clearTimeout(task);
  }, [deletedFilter, loadData]);

  async function handleSubmit(input: CreateAdminComicInput) {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (editingComic) {
        await updateAdminComic(editingComic.id, input);
        setSuccessMessage("Cap nhat truyen thanh cong");
      } else {
        await createAdminComic(input);
        setSuccessMessage("Them truyen thanh cong");
      }

      setEditingComic(null);
      await reloadComics();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Luu truyen that bai",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(comic: AdminComic) {
    const confirmed = window.confirm(
      `Truyen "${comic.name}" se duoc an khoi public, khong bi xoa vinh vien. Tiep tuc?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(comic.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await deleteAdminComic(comic.id);
      setSuccessMessage(result.message || "Xoa truyen thanh cong");

      if (editingComic?.id === comic.id) {
        setEditingComic(null);
      }

      await reloadComics();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Xoa truyen that bai",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quan ly truyen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tao, sua va xoa truyen. Chapters va upload anh se lam o buoc sau.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Dang tai du lieu admin comics...
        </div>
      ) : (
        <>
          <AdminComicForm
            authors={authors}
            categories={categories}
            initialValue={editingComic}
            isSubmitting={isSubmitting}
            mode={editingComic ? "edit" : "create"}
            onCancel={() => setEditingComic(null)}
            onSubmit={handleSubmit}
          />

          <div className="flex flex-wrap items-center gap-3 rounded-lg border p-4 text-sm">
            <label htmlFor="comic-deleted-filter" className="font-medium">
              Trang thai
            </label>
            <select
              id="comic-deleted-filter"
              value={deletedFilter}
              onChange={(event) => {
                setDeletedFilter(event.target.value as DeletedFilter);
                setEditingComic(null);
              }}
              className="h-10 rounded-md border bg-background px-3 outline-none focus:border-primary"
            >
              <option value="active">Active</option>
              <option value="deleted">Deleted</option>
              <option value="all">All</option>
            </select>
            <span className="text-muted-foreground">
              Mac dinh chi hien thi truyen active.
            </span>
          </div>

          {successMessage ? (
            <div className="rounded-md border border-green-600/30 bg-green-600/10 p-3 text-sm text-green-700 dark:text-green-300">
              {successMessage}
            </div>
          ) : null}

          <AdminComicsTable
            comics={comics}
            deletingId={deletingId}
            onDelete={handleDelete}
            onEdit={setEditingComic}
          />
        </>
      )}

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
