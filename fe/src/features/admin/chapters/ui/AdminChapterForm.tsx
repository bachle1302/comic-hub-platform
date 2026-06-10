"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  createAdminChapterInputSchema,
  type AdminChapter,
  type ChapterImageInput,
  type CreateAdminChapterInput,
  type UpdateAdminChapterInput,
} from "../api/admin-chapters.schema";
import { ChapterImageUploader } from "./ChapterImageUploader";

type ChapterFormValues = z.input<typeof createAdminChapterInputSchema>;

type AdminChapterFormProps = {
  comicSlug: string;
  initialValue?: AdminChapter | null;
  mode: "create" | "edit";
  onCancel?: () => void;
  onSubmit: (
    input: CreateAdminChapterInput | UpdateAdminChapterInput,
  ) => Promise<void>;
};

function getDefaultValues(initialValue?: AdminChapter | null): ChapterFormValues {
  return {
    name: initialValue?.name ?? "",
    chapterNumber: initialValue?.chapterNumber ?? 1,
    price: initialValue?.price ?? 0,
    isPublic: initialValue?.isPublic ?? true,
  };
}

function toImageInput(
  image: NonNullable<AdminChapter["images"]>[number],
): ChapterImageInput {
  return {
    url: image.url,
    key: image.key ?? undefined,
    order: image.order,
    width: image.width ?? undefined,
    height: image.height ?? undefined,
    size: image.size ?? undefined,
    mimeType: image.mimeType ?? undefined,
  };
}

export function AdminChapterForm({
  comicSlug,
  initialValue,
  mode,
  onCancel,
  onSubmit,
}: AdminChapterFormProps) {
  const [hasUploadedNewImages, setHasUploadedNewImages] = useState(false);
  const [images, setImages] = useState<ChapterImageInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ChapterFormValues>({
    resolver: zodResolver(createAdminChapterInputSchema),
    defaultValues: getDefaultValues(initialValue),
  });
  const chapterNumber = useWatch({
    control,
    name: "chapterNumber",
  });

  useEffect(() => {
    const task = window.setTimeout(() => {
      reset(getDefaultValues(initialValue));
      setHasUploadedNewImages(false);
      setImages(initialValue?.images?.map(toImageInput) ?? []);
    }, 0);

    return () => window.clearTimeout(task);
  }, [initialValue, reset]);

  async function submit(input: ChapterFormValues) {
    setIsSubmitting(true);

    try {
      const parsed = createAdminChapterInputSchema.parse(input);
      const payload:
        | CreateAdminChapterInput
        | UpdateAdminChapterInput = {
        ...parsed,
        ...(mode === "create" || hasUploadedNewImages ? { images } : {}),
      };

      await onSubmit(payload);

      if (mode === "create") {
        reset(getDefaultValues(null));
        setImages([]);
        setHasUploadedNewImages(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleImagesChange(nextImages: ChapterImageInput[]) {
    setImages(nextImages);
    setHasUploadedNewImages(true);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-5 rounded-lg border bg-card p-4"
    >
      <div>
        <h2 className="text-lg font-semibold">
          {mode === "edit" ? "Sửa chương" : "Thêm chương"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nhập thông tin chương và tải ảnh lên bằng URL ký trước (presigned URL).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="chapter-name" className="text-sm font-medium">
            Tên chương
          </label>
          <input
            id="chapter-name"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="chapter-number" className="text-sm font-medium">
            Số thứ tự chương
          </label>
          <input
            id="chapter-number"
            type="number"
            step="0.1"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("chapterNumber", { valueAsNumber: true })}
          />
          {errors.chapterNumber ? (
            <p className="text-sm text-destructive">
              {errors.chapterNumber.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="chapter-price" className="text-sm font-medium">
            Giá coin
          </label>
          <input
            id="chapter-price"
            type="number"
            min={0}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price ? (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          ) : null}
        </div>
      </div>

      <label className="flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-sm">
        <input type="checkbox" {...register("isPublic")} />
        Chương công khai
      </label>

      {mode === "edit" && initialValue?.images?.length ? (
        <div className="rounded-md border p-3">
          <p className="text-sm font-medium">Ảnh hiện tại</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tải ảnh mới lên sẽ thay thế toàn bộ ảnh cũ khi cập nhật.
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {initialValue.images.slice(0, 8).map((image) => (
              <div key={`${image.order}-${image.url}`} className="space-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={`Page ${image.order}`}
                  className="aspect-[2/3] w-full rounded border object-cover"
                />
                <p className="text-center text-xs text-muted-foreground">
                  #{image.order}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <ChapterImageUploader
        chapterNumber={Number.isFinite(chapterNumber) ? chapterNumber : null}
        comicSlug={comicSlug}
        disabled={isSubmitting}
        onImagesChange={handleImagesChange}
        onUploadingChange={setIsUploading}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting
            ? "Đang lưu..."
            : mode === "edit"
              ? "Cập nhật chương"
              : "Thêm chương"}
        </Button>
        {mode === "edit" && onCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || isUploading}
            onClick={onCancel}
          >
            Hủy
          </Button>
        ) : null}
      </div>
    </form>
  );
}
