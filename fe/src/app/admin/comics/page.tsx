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
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletedFilter, setDeletedFilter] = useState<DeletedFilter>("active");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadComics = useCallback(async (deleted: DeletedFilter) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setComics(await getAdminComics({ deleted }));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không tải được danh sách truyện",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    setErrorMessage(null);

    try {
      const [nextAuthors, nextCategories] = await Promise.all([
        getAdminAuthors(),
        getAdminCategories(),
      ]);

      setAuthors(nextAuthors);
      setCategories(nextCategories);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không tải được danh sách lựa chọn",
      );
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadOptions();
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadOptions]);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadComics(deletedFilter);
    }, 0);

    return () => window.clearTimeout(task);
  }, [deletedFilter, loadComics]);

  async function handleSubmit(input: CreateAdminComicInput) {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (editingComic) {
        const updatedComic = await updateAdminComic(editingComic.id, input);
        setComics((currentComics) =>
          currentComics.map((comic) =>
            comic.id === updatedComic.id ? updatedComic : comic,
          ),
        );
        setSuccessMessage("Cập nhật truyện thành công");
      } else {
        const createdComic = await createAdminComic(input);
        if (deletedFilter !== "deleted") {
          setComics((currentComics) => [createdComic, ...currentComics]);
        }
        setSuccessMessage("Thêm truyện thành công");
      }

      setEditingComic(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Lưu truyện thất bại",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(comic: AdminComic) {
    const confirmed = window.confirm(
      `Truyện "${comic.name}" sẽ được ẩn khỏi công khai, không bị xóa vĩnh viễn. Tiếp tục?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(comic.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await deleteAdminComic(comic.id);
      setSuccessMessage(result.message || "Xóa truyện thành công");
      setComics((currentComics) => {
        if (deletedFilter === "all") {
          return currentComics.map((currentComic) =>
            currentComic.id === comic.id
              ? { ...currentComic, isDeleted: true }
              : currentComic,
          );
        }

        return currentComics.filter((currentComic) => currentComic.id !== comic.id);
      });

      if (editingComic?.id === comic.id) {
        setEditingComic(null);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Xóa truyện thất bại",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý truyện tranh</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo, sửa và xóa truyện. Chương và tải lên ảnh sẽ làm ở bước sau.
        </p>
      </div>

      {isLoading || isLoadingOptions ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Đang tải dữ liệu truyện tranh...
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
              Trạng thái
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
              <option value="active">Hoạt động</option>
              <option value="deleted">Đã xóa</option>
              <option value="all">Tất cả</option>
            </select>
            <span className="text-muted-foreground">
              Mặc định chỉ hiển thị truyện đang hoạt động.
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
