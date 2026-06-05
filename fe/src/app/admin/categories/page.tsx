"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminCategoriesTable,
  AdminCategoryForm,
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
  type AdminCategory,
  type CreateAdminCategoryInput,
} from "@/features/admin/categories";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [editingCategory, setEditingCategory] =
    useState<AdminCategory | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setCategories(await getAdminCategories());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Khong tai duoc the loai",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadCategories();
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadCategories]);

  async function handleSubmit(input: CreateAdminCategoryInput) {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, input);
        setSuccessMessage("Cap nhat the loai thanh cong");
      } else {
        await createAdminCategory(input);
        setSuccessMessage("Them the loai thanh cong");
      }

      setEditingCategory(null);
      await loadCategories();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Luu the loai that bai",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(category: AdminCategory) {
    const confirmed = window.confirm(`Xoa the loai "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(category.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteAdminCategory(category.id);
      setSuccessMessage("Xoa the loai thanh cong");

      if (editingCategory?.id === category.id) {
        setEditingCategory(null);
      }

      await loadCategories();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Xoa the loai that bai",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tao, sua va xoa the loai trong catalog.
        </p>
      </div>

      <AdminCategoryForm
        initialCategory={editingCategory}
        isSubmitting={isSubmitting}
        onCancel={() => setEditingCategory(null)}
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
          Dang tai danh sach the loai...
        </div>
      ) : (
        <AdminCategoriesTable
          categories={categories}
          deletingId={deletingId}
          onDelete={handleDelete}
          onEdit={setEditingCategory}
        />
      )}
    </div>
  );
}
