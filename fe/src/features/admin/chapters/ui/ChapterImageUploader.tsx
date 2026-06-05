"use client";

import { ChangeEvent, useMemo, useState } from "react";
import {
  createPresignedUploadUrls,
  uploadFileToStorage,
} from "@/features/admin/upload";
import type { ChapterImageInput } from "../api/admin-chapters.schema";

type ChapterImageUploaderProps = {
  chapterNumber: number | null;
  comicSlug: string;
  disabled?: boolean;
  onImagesChange: (images: ChapterImageInput[]) => void;
  onUploadingChange?: (isUploading: boolean) => void;
};

type UploadStatus = "idle" | "uploading" | "done" | "error";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function sortFilesByName(files: File[]): File[] {
  return [...files].sort((first, second) =>
    first.name.localeCompare(second.name, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

export function ChapterImageUploader({
  chapterNumber,
  comicSlug,
  disabled = false,
  onImagesChange,
  onUploadingChange,
}: ChapterImageUploaderProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [images, setImages] = useState<ChapterImageInput[]>([]);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const previews = useMemo(() => images.slice(0, 8), [images]);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    setErrorMessage(null);

    if (!chapterNumber || chapterNumber <= 0) {
      setStatus("error");
      setErrorMessage("Vui long nhap chapter number truoc khi upload anh");
      return;
    }

    if (selectedFiles.length === 0) {
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) => !acceptedTypes.includes(file.type),
    );

    if (invalidFile) {
      setStatus("error");
      setErrorMessage(`File ${invalidFile.name} khong phai dinh dang anh hop le`);
      return;
    }

    const sortedFiles = sortFilesByName(selectedFiles);

    try {
      setStatus("uploading");
      onUploadingChange?.(true);
      setUploadedCount(0);
      setUploadTotal(sortedFiles.length);
      setImages([]);
      onImagesChange([]);

      const presignedResult = await createPresignedUploadUrls({
        comicSlug,
        chapterNumber,
        files: sortedFiles.map((file, index) => ({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          order: index + 1,
        })),
      });

      const nextImages: ChapterImageInput[] = [];

      for (const upload of presignedResult.uploads) {
        const file = sortedFiles.find(
          (item) => item.name === upload.fileName && item.type === upload.contentType,
        );

        if (!file) {
          throw new Error(`Khong tim thay file ${upload.fileName}`);
        }

        await uploadFileToStorage({
          uploadUrl: upload.uploadUrl,
          file,
          contentType: upload.contentType,
        });

        nextImages.push({
          url: upload.publicUrl,
          key: upload.key,
          order: upload.order,
          size: file.size,
          mimeType: upload.contentType,
        });
        setUploadedCount(nextImages.length);
      }

      const orderedImages = nextImages.sort((first, second) => first.order - second.order);
      setImages(orderedImages);
      onImagesChange(orderedImages);
      setStatus("done");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Upload anh that bai");
    } finally {
      onUploadingChange?.(false);
    }
  }

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Anh chapter</p>
          <p className="text-xs text-muted-foreground">
            Chon nhieu anh, file se duoc upload theo thu tu ten tang dan.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm hover:bg-muted aria-disabled:pointer-events-none aria-disabled:opacity-50">
          Chon anh
          <input
            type="file"
            accept={acceptedTypes.join(",")}
            multiple
            className="sr-only"
            disabled={disabled || status === "uploading"}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="text-sm text-muted-foreground">
        {status === "idle" ? "Chua upload anh moi." : null}
        {status === "uploading"
          ? `Dang upload ${uploadedCount}/${uploadTotal} anh...`
          : null}
        {status === "done" ? `Da upload ${images.length} anh.` : null}
        {status === "error" ? "Upload loi." : null}
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {previews.length > 0 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {previews.map((image) => (
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
      ) : null}
    </div>
  );
}
