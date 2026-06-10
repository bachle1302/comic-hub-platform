"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangeEvent, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { AdminAuthor } from "@/features/admin/authors";
import type { AdminCategory } from "@/features/admin/categories";
import {
  createPresignedComicAvatarUploadUrl,
  uploadFileToStorage,
} from "@/features/admin/upload";
import {
  comicStatusSchema,
  createAdminComicInputSchema,
  type AdminComic,
  type ComicStatus,
  type CreateAdminComicInput,
} from "../api/admin-comics.schema";

type AdminComicFormProps = {
  authors: AdminAuthor[];
  categories: AdminCategory[];
  initialValue?: AdminComic | null;
  isSubmitting?: boolean;
  mode: "create" | "edit";
  onCancel?: () => void;
  onSubmit: (input: CreateAdminComicInput) => Promise<void>;
};

const statusLabels: Record<ComicStatus, string> = {
  ONGOING: "Đang tiến hành",
  COMPLETED: "Hoàn thành",
  HIATUS: "Tạm ngưng",
  CANCELLED: "Đã hủy",
};

const statusOptions: Array<{ label: string; value: ComicStatus }> =
  comicStatusSchema.options.map((value) => ({
    label: statusLabels[value],
    value,
  }));

const acceptedAvatarTypes = ["image/jpeg", "image/png", "image/webp"];

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDefaultValues(
  initialValue?: AdminComic | null,
): CreateAdminComicInput {
  return {
    name: initialValue?.name ?? "",
    slug: initialValue?.slug ?? "",
    description: initialValue?.description ?? "",
    seoTitle: initialValue?.seoTitle ?? "",
    seoDescription: initialValue?.seoDescription ?? "",
    thumbnail: initialValue?.thumbnail ?? "",
    status: initialValue?.status ?? "ONGOING",
    isPublic: initialValue?.isPublic ?? true,
    authorId: initialValue?.authorId ?? initialValue?.author?.id ?? 0,
    categoryIds:
      initialValue?.categories?.map((item) => item.category.id) ?? [],
  };
}

export function AdminComicForm({
  authors,
  categories,
  initialValue,
  isSubmitting = false,
  mode,
  onCancel,
  onSubmit,
}: AdminComicFormProps) {
  const [avatarUploadStatus, setAvatarUploadStatus] = useState<
    "idle" | "uploading" | "done" | "error"
  >("idle");
  const [avatarUploadMessage, setAvatarUploadMessage] = useState("");
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<CreateAdminComicInput>({
    resolver: zodResolver(createAdminComicInputSchema),
    defaultValues: getDefaultValues(initialValue),
  });
  const selectedCategoryIds =
    useWatch({
      control,
      name: "categoryIds",
    }) ?? [];
  const watchedSlug = useWatch({
    control,
    name: "slug",
  });
  const watchedThumbnail = useWatch({
    control,
    name: "thumbnail",
  });

  useEffect(() => {
    reset(getDefaultValues(initialValue));
  }, [initialValue, reset]);

  async function submit(input: CreateAdminComicInput) {
    await onSubmit(input);

    if (mode === "create") {
      reset(getDefaultValues(null));
    }
  }

  function toggleCategory(categoryId: number, checked: boolean) {
    const currentIds = getValues("categoryIds") ?? [];
    const nextIds = checked
      ? Array.from(new Set([...currentIds, categoryId]))
      : currentIds.filter((id) => id !== categoryId);

    setValue("categoryIds", nextIds, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function generateSlug() {
    setValue("slug", toSlug(getValues("name")), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function uploadComicAvatar(file: File) {
    const comicSlug = (getValues("slug") || watchedSlug || "").trim();

    if (!comicSlug) {
      setAvatarUploadStatus("error");
      setAvatarUploadMessage("Vui lòng nhập slug trước khi tải ảnh lên.");
      return;
    }

    if (!acceptedAvatarTypes.includes(file.type)) {
      setAvatarUploadStatus("error");
      setAvatarUploadMessage("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
      return;
    }

    setAvatarUploadStatus("uploading");
    setAvatarUploadMessage("Đang tải ảnh đại diện lên...");

    try {
      const { upload } = await createPresignedComicAvatarUploadUrl({
        comicSlug,
        file: {
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          order: 1,
        },
      });

      await uploadFileToStorage({
        uploadUrl: upload.uploadUrl,
        file,
        contentType: upload.contentType,
      });

      setValue("thumbnail", upload.publicUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setAvatarUploadStatus("done");
      setAvatarUploadMessage("Đã tải ảnh đại diện lên.");
    } catch (error) {
      setAvatarUploadStatus("error");
      setAvatarUploadMessage(
        error instanceof Error ? error.message : "Tải ảnh đại diện lên thất bại.",
      );
    }
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    void uploadComicAvatar(file);
    event.target.value = "";
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-5 rounded-lg border bg-card p-4"
    >
      <div>
        <h2 className="text-lg font-semibold">
          {mode === "edit" ? "Sửa truyện" : "Thêm truyện"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nhập thông tin danh mục, SEO và liên kết tác giả/thể loại.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="comic-name" className="text-sm font-medium">
            Tên truyện
          </label>
          <input
            id="comic-name"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="comic-slug" className="text-sm font-medium">
            Slug
          </label>
          <div className="flex gap-2">
            <input
              id="comic-slug"
              className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
              {...register("slug")}
            />
            <Button type="button" variant="outline" onClick={generateSlug}>
              Tạo slug
            </Button>
          </div>
          {errors.slug ? (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="comic-description" className="text-sm font-medium">
          Mô tả
        </label>
        <textarea
          id="comic-description"
          rows={4}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          {...register("description")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="comic-thumbnail" className="text-sm font-medium">
            Ảnh đại diện / URL ảnh
          </label>
          <input
            id="comic-thumbnail"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("thumbnail")}
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="comic-avatar-file"
              type="file"
              accept={acceptedAvatarTypes.join(",")}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground sm:w-auto"
              disabled={avatarUploadStatus === "uploading" || isSubmitting}
              onChange={handleAvatarChange}
            />
            {avatarUploadStatus === "uploading" ? (
              <span className="text-sm text-muted-foreground">Đang tải lên...</span>
            ) : null}
          </div>
          {avatarUploadMessage ? (
            <p
              className={
                avatarUploadStatus === "error"
                  ? "text-sm text-destructive"
                  : "text-sm text-muted-foreground"
              }
            >
              {avatarUploadMessage}
            </p>
          ) : null}
          {watchedThumbnail ? (
            <div className="w-24 overflow-hidden rounded-md border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={watchedThumbnail}
                alt="Ảnh đại diện truyện"
                className="aspect-[2/3] w-full object-cover"
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="comic-seo-title" className="text-sm font-medium">
            SEO title
          </label>
          <input
            id="comic-seo-title"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("seoTitle")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="comic-seo-description" className="text-sm font-medium">
          SEO description
        </label>
        <input
          id="comic-seo-description"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          {...register("seoDescription")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="comic-status" className="text-sm font-medium">
            Trạng thái
          </label>
          <select
            id="comic-status"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("status")}
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="comic-author" className="text-sm font-medium">
            Tác giả
          </label>
          <select
            id="comic-author"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("authorId", { valueAsNumber: true })}
          >
            <option value={0}>Chọn tác giả</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          {errors.authorId ? (
            <p className="text-sm text-destructive">
              {errors.authorId.message}
            </p>
          ) : null}
        </div>

        <label className="flex items-center gap-2 self-end rounded-md border px-3 py-2 text-sm">
          <input type="checkbox" {...register("isPublic")} />
          Công khai
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Thể loại</p>
        {categories.length === 0 ? (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            Chưa có thể loại để chọn.
          </div>
        ) : (
          <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(category.id)}
                  onChange={(event) =>
                     toggleCategory(category.id, event.target.checked)
                  }
                />
                {category.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Đang lưu..."
            : mode === "edit"
              ? "Cập nhật truyện"
              : "Thêm truyện"}
        </Button>
        {mode === "edit" && onCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Hủy
          </Button>
        ) : null}
      </div>
    </form>
  );
}
