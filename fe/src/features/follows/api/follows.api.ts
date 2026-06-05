import {
  clientApiDelete,
  clientApiGet,
  clientApiPost,
} from "@/shared/api/client-api";
import {
  followedComicsSchema,
  followComicResultSchema,
  followStatusSchema,
  unfollowComicResultSchema,
  type FollowComicResult,
  type FollowedComic,
  type FollowStatus,
  type UnfollowComicResult,
} from "./follows.schema";

export function getFollowStatus(comicId: number): Promise<FollowStatus> {
  return clientApiGet(`/follows/comics/${comicId}/status`, followStatusSchema, {
    auth: true,
  });
}

export function followComic(comicId: number): Promise<FollowComicResult> {
  return clientApiPost(
    `/follows/comics/${comicId}`,
    followComicResultSchema,
    undefined,
    {
      auth: true,
    },
  );
}

export function unfollowComic(
  comicId: number,
): Promise<UnfollowComicResult> {
  return clientApiDelete(
    `/follows/comics/${comicId}`,
    unfollowComicResultSchema,
    {
      auth: true,
    },
  );
}

export function getMyFollows(): Promise<FollowedComic[]> {
  return clientApiGet("/follows/me", followedComicsSchema, {
    auth: true,
  });
}
