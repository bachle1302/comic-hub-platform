import { serverApiGet } from "@/shared/api/server-api";
import {
  clientApiDelete,
  clientApiGet,
  clientApiPost,
} from "@/shared/api/client-api";
import {
  comicDetailSchema,
  comicLikeStatusSchema,
  comicListSchema,
} from "./comics.schema";
import { chapterReaderSchema } from "@/features/reader/api/reader.schema";

export function getAllComics() {
  return serverApiGet("/comics", comicListSchema, {
    revalidate: 60,
    tags: ["comics"],
  });
}

export function getLatestComics() {
  return serverApiGet("/comics/latest", comicListSchema, {
    revalidate: 60,
    tags: ["comics", "comics-latest"],
  });
}

export function getHotComics() {
  return serverApiGet("/comics/hot", comicListSchema, {
    revalidate: 60,
    tags: ["comics", "comics-hot"],
  });
}

export function getComicDetail(slug: string) {
  return serverApiGet(`/comics/${slug}`, comicDetailSchema, {
    revalidate: 60,
    tags: ["comics", `comic-${slug}`],
  });
}

export function getChapter(slug: string, chapterNumber: string | number) {
  return serverApiGet(
    `/comics/${slug}/chapters/${chapterNumber}`,
    chapterReaderSchema,
    {
      revalidate: 120,
      tags: ["comics", `comic-${slug}`, `chapter-${slug}-${chapterNumber}`],
    },
  );
}

export function likeComic(comicId: number) {
  return clientApiPost(
    `/comics/${comicId}/like`,
    comicLikeStatusSchema,
    undefined,
  );
}

export function unlikeComic(comicId: number) {
  return clientApiDelete(`/comics/${comicId}/like`, comicLikeStatusSchema);
}

export function getComicLikeStatus(comicId: number) {
  return clientApiGet(`/comics/${comicId}/like-status`, comicLikeStatusSchema);
}
