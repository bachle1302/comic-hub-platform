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
        error instanceof Error ? error.message : "Không tải được thể loại",
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
        const updatedCategory = await updateAdminCategory(editingCategory.id, input);
        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category,
          ),
        );
        setSuccessMessage("Cập nhật thể loại thành công");
      } else {
        const createdCategory = await createAdminCategory(input);
        setCategories((currentCategories) => [
          createdCategory,
          ...currentCategories,
        ]);
        setSuccessMessage("Thêm thể loại thành công");
      }

      setEditingCategory(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Lưu thể loại thất bại",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(category: AdminCategory) {
    const confirmed = window.confirm(`Xóa thể loại "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(category.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteAdminCategory(category.id);
      setCategories((currentCategories) =>
        currentCategories.filter(
          (currentCategory) => currentCategory.id !== category.id,
        ),
      );
      setSuccessMessage("Xóa thể loại thành công");

      if (editingCategory?.id === category.id) {
        setEditingCategory(null);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Xóa thể loại thất bại",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Thể loại</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo, sửa và xóa thể loại trong danh mục.
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
          Đang tải danh sách thể loại...
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
