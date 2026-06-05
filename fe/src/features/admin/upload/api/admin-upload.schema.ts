import { z } from "zod";

export const presignedUploadFileInputSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  size: z.number().optional(),
  order: z.number().optional(),
});

export const createPresignedUploadInputSchema = z.object({
  comicSlug: z.string(),
  chapterNumber: z.number(),
  files: z.array(presignedUploadFileInputSchema),
});

export const createPresignedComicAvatarUploadInputSchema = z.object({
  comicSlug: z.string(),
  file: presignedUploadFileInputSchema,
});

export const presignedUploadItemSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  key: z.string(),
  uploadUrl: z.string(),
  publicUrl: z.string(),
  order: z.number(),
});

export const presignedUploadResultSchema = z.object({
  uploads: z.array(presignedUploadItemSchema),
});

export const presignedComicAvatarUploadResultSchema = z.object({
  upload: presignedUploadItemSchema,
});

export type PresignedUploadFileInput = z.infer<
  typeof presignedUploadFileInputSchema
>;
export type CreatePresignedUploadInput = z.infer<
  typeof createPresignedUploadInputSchema
>;
export type CreatePresignedComicAvatarUploadInput = z.infer<
  typeof createPresignedComicAvatarUploadInputSchema
>;
export type PresignedUploadItem = z.infer<typeof presignedUploadItemSchema>;
export type PresignedUploadResult = z.infer<typeof presignedUploadResultSchema>;
export type PresignedComicAvatarUploadResult = z.infer<
  typeof presignedComicAvatarUploadResultSchema
>;
