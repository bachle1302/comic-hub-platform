"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminAuthorForm,
  AdminAuthorsTable,
  createAdminAuthor,
  deleteAdminAuthor,
  getAdminAuthors,
  updateAdminAuthor,
  type AdminAuthor,
  type CreateAdminAuthorInput,
} from "@/features/admin/authors";

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<AdminAuthor[]>([]);
  const [editingAuthor, setEditingAuthor] = useState<AdminAuthor | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadAuthors = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setAuthors(await getAdminAuthors());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Khong tai duoc tac gia",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadAuthors();
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadAuthors]);

  async function handleSubmit(input: CreateAdminAuthorInput) {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (editingAuthor) {
        await updateAdminAuthor(editingAuthor.id, input);
        setSuccessMessage("Cap nhat tac gia thanh cong");
      } else {
        await createAdminAuthor(input);
        setSuccessMessage("Them tac gia thanh cong");
      }

      setEditingAuthor(null);
      await loadAuthors();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Luu tac gia that bai",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(author: AdminAuthor) {
    const confirmed = window.confirm(`Xoa tac gia "${author.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(author.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteAdminAuthor(author.id);
      setSuccessMessage("Xoa tac gia thanh cong");

      if (editingAuthor?.id === author.id) {
        setEditingAuthor(null);
      }

      await loadAuthors();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Xoa tac gia that bai",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Authors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tao, sua va xoa tac gia trong catalog.
        </p>
      </div>

      <AdminAuthorForm
        initialAuthor={editingAuthor}
        isSubmitting={isSubmitting}
        onCancel={() => setEditingAuthor(null)}
        onSubmit={handleSubmit}
      />

      {successMessage ? (
        <div className="rounded-md border border-green-600/30 bg-green-600/10 p-3 text-sm text-green-700 dark:text-green-300">
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
          Dang tai danh sach tac gia...
        </div>
      ) : (
        <AdminAuthorsTable
          authors={authors}
          deletingId={deletingId}
          onDelete={handleDelete}
          onEdit={setEditingAuthor}
        />
      )}
    </div>
  );
}
