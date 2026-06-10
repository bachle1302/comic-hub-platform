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
        error instanceof Error ? error.message : "Không tải được tác giả",
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
        const updatedAuthor = await updateAdminAuthor(editingAuthor.id, input);
        setAuthors((currentAuthors) =>
          currentAuthors.map((author) =>
            author.id === updatedAuthor.id ? updatedAuthor : author,
          ),
        );
        setSuccessMessage("Cập nhật tác giả thành công");
      } else {
        const createdAuthor = await createAdminAuthor(input);
        setAuthors((currentAuthors) => [createdAuthor, ...currentAuthors]);
        setSuccessMessage("Thêm tác giả thành công");
      }

      setEditingAuthor(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Lưu tác giả thất bại",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(author: AdminAuthor) {
    const confirmed = window.confirm(`Xóa tác giả "${author.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(author.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteAdminAuthor(author.id);
      setAuthors((currentAuthors) =>
        currentAuthors.filter((currentAuthor) => currentAuthor.id !== author.id),
      );
      setSuccessMessage("Xóa tác giả thành công");

      if (editingAuthor?.id === author.id) {
        setEditingAuthor(null);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Xóa tác giả thất bại",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tác giả</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo, sửa và xóa tác giả trong danh mục.
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
          Đang tải danh sách tác giả...
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
