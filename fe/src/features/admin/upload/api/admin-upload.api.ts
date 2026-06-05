import { clientApiPost } from "@/shared/api/client-api";
import {
  presignedComicAvatarUploadResultSchema,
  presignedUploadResultSchema,
  type CreatePresignedComicAvatarUploadInput,
  type CreatePresignedUploadInput,
  type PresignedComicAvatarUploadResult,
  type PresignedUploadResult,
} from "./admin-upload.schema";

export function createPresignedUploadUrls(
  input: CreatePresignedUploadInput,
): Promise<PresignedUploadResult> {
  return clientApiPost(
    "/admin/upload/presigned-urls",
    presignedUploadResultSchema,
    input,
    {
      auth: true,
    },
  );
}

export function createPresignedComicAvatarUploadUrl(
  input: CreatePresignedComicAvatarUploadInput,
): Promise<PresignedComicAvatarUploadResult> {
  return clientApiPost(
    "/admin/upload/comic-avatar/presigned-url",
    presignedComicAvatarUploadResultSchema,
    input,
    {
      auth: true,
    },
  );
}

export async function uploadFileToStorage(input: {
  uploadUrl: string;
  file: File;
  contentType: string;
}): Promise<void> {
  const response = await fetch(input.uploadUrl, {
    method: "PUT",
    body: input.file,
    headers: {
      "Content-Type": input.contentType,
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}
