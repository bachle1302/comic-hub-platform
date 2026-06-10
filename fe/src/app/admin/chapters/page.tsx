"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminComics, type AdminComic } from "@/features/admin/comics";
import {
  AdminChapterForm,
  AdminChaptersTable,
  createAdminChapter,
  deleteAdminChapter,
  getAdminChapter,
  getAdminChapters,
  updateAdminChapter,
  type AdminChapter,
  type AdminChaptersQuery,
  type CreateAdminChapterInput,
  type UpdateAdminChapterInput,
} from "@/features/admin/chapters";

type DeletedFilter = NonNullable<AdminChaptersQuery["deleted"]>;

export default function AdminChaptersPage() {
  const [chapters, setChapters] = useState<AdminChapter[]>([]);
  const [comics, setComics] = useState<AdminComic[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingChapter, setEditingChapter] = useState<AdminChapter | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [selectedComicId, setSelectedComicId] = useState<number | null>(null);
  const [deletedFilter, setDeletedFilter] = useState<DeletedFilter>("active");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedComic = useMemo(
    () => comics.find((comic) => comic.id === selectedComicId) ?? null,
    [comics, selectedComicId],
  );

  const loadChapters = useCallback(async (
    comicId: number,
    deleted: DeletedFilter = "active",
  ) => {
    setIsLoadingChapters(true);
    setErrorMessage(null);

    try {
      setChapters(await getAdminChapters(comicId, { deleted }));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không tải được chương truyện",
      );
    } finally {
      setIsLoadingChapters(false);
    }
  }, []);

  const loadComics = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextComics = await getAdminComics();
      setComics(nextComics);

      if (nextComics.length > 0) {
        setSelectedComicId(nextComics[0].id);
        await loadChapters(nextComics[0].id, "active");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không tải được danh sách truyện",
      );
    } finally {
      setIsLoading(false);
    }
  }, [loadChapters]);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadComics();
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadComics]);

  async function handleSelectComic(comicId: number) {
    setSelectedComicId(comicId);
    setEditingChapter(null);
    setSuccessMessage(null);
    await loadChapters(comicId, deletedFilter);
  }

  async function handleSubmit(
    input: CreateAdminChapterInput | UpdateAdminChapterInput,
  ) {
    if (!selectedComic) {
      setErrorMessage("Vui lòng chọn truyện trước");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (editingChapter) {
        const updatedChapter = await updateAdminChapter(editingChapter.id, input);
        setChapters((currentChapters) =>
          currentChapters.map((chapter) =>
            chapter.id === updatedChapter.id ? updatedChapter : chapter,
          ),
        );
        setSuccessMessage("Cập nhật chương truyện thành công");
      } else {
        const createdChapter = await createAdminChapter(
          selectedComic.id,
          input as CreateAdminChapterInput,
        );
        if (deletedFilter !== "deleted") {
          setChapters((currentChapters) => [createdChapter, ...currentChapters]);
        }
        setSuccessMessage("Thêm chương truyện thành công");
      }

      setEditingChapter(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Lưu chương truyện thất bại",
      );
    }
  }

  async function handleEdit(chapter: AdminChapter) {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      setEditingChapter(await getAdminChapter(chapter.id));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không tải được chi tiết chương",
      );
    }
  }

  async function handleDelete(chapter: AdminChapter) {
    const confirmed = window.confirm(
      `Chương truyện "${chapter.name}" sẽ được ẩn khỏi công khai, không bị xóa vĩnh viễn. Tiếp tục?`,
    );

    if (!confirmed || !selectedComic) {
      return;
    }

    setDeletingId(chapter.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await deleteAdminChapter(chapter.id);
      setSuccessMessage(result.message);
      setChapters((currentChapters) => {
        if (deletedFilter === "all") {
          return currentChapters.map((currentChapter) =>
            currentChapter.id === chapter.id
              ? { ...currentChapter, isDeleted: true }
              : currentChapter,
          );
        }

        return currentChapters.filter(
          (currentChapter) => currentChapter.id !== chapter.id,
        );
      });

      if (editingChapter?.id === chapter.id) {
        setEditingChapter(null);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Xóa chương truyện thất bại",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý chương truyện</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo chương truyện, tải ảnh lên kho lưu trữ và lưu siêu dữ liệu vào hệ thống.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Đang tải danh sách truyện...
        </div>
      ) : comics.length === 0 ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Vui lòng tạo truyện trước.
        </div>
      ) : (
        <>
          <div className="space-y-2 rounded-lg border bg-card p-4">
            <label htmlFor="chapter-comic" className="text-sm font-medium">
              Chọn truyện
            </label>
            <select
              id="chapter-comic"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
              value={selectedComicId ?? ""}
              onChange={(event) => void handleSelectComic(Number(event.target.value))}
            >
              {comics.map((comic) => (
                <option key={comic.id} value={comic.id}>
                  {comic.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-lg border p-4 text-sm">
            <label htmlFor="chapter-deleted-filter" className="font-medium">
              Trạng thái chương truyện
            </label>
            <select
              id="chapter-deleted-filter"
              value={deletedFilter}
              onChange={(event) => {
                const nextDeletedFilter = event.target.value as DeletedFilter;

                setDeletedFilter(nextDeletedFilter);
                setEditingChapter(null);
                if (selectedComicId !== null) {
                  void loadChapters(selectedComicId, nextDeletedFilter);
                }
              }}
              className="h-10 rounded-md border bg-background px-3 outline-none focus:border-primary"
            >
              <option value="active">Hoạt động</option>
              <option value="deleted">Đã xóa</option>
              <option value="all">Tất cả</option>
            </select>
            <span className="text-muted-foreground">
              Lọc chương truyện của truyện đang chọn theo trạng thái.
            </span>
          </div>

          {selectedComic ? (
            <AdminChapterForm
              key={`${selectedComic.id}-${editingChapter?.id ?? "create"}`}
              comicSlug={selectedComic.slug}
              initialValue={editingChapter}
              mode={editingChapter ? "edit" : "create"}
              onCancel={() => setEditingChapter(null)}
              onSubmit={handleSubmit}
            />
          ) : null}

          {successMessage ? (
            <div className="rounded-md border border-green-600/30 bg-green-600/10 p-3 text-sm text-green-700 dark:text-green-300">
              {successMessage}
            </div>
          ) : null}

          {isLoadingChapters ? (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              Đang tải danh sách chương truyện...
            </div>
          ) : (
            <AdminChaptersTable
              chapters={chapters}
              deletingId={deletingId}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
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
