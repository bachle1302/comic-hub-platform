import {
  clientApiDelete,
  clientApiGet,
  clientApiPost,
} from "@/shared/api/client-api";
import {
  comicHistoryResultSchema,
  deleteHistoryResultSchema,
  historiesSchema,
  historyItemSchema,
  type ComicHistoryResult,
  type DeleteHistoryResult,
  type HistoryItem,
  type UpsertHistoryInput,
} from "./histories.schema";

export function saveHistory(input: UpsertHistoryInput): Promise<HistoryItem> {
  return clientApiPost("/histories", historyItemSchema, input, {
    auth: true,
  });
}

export function getMyHistories(limit?: number): Promise<HistoryItem[]> {
  const query = limit ? `?limit=${encodeURIComponent(String(limit))}` : "";

  return clientApiGet(`/histories/me${query}`, historiesSchema, {
    auth: true,
  });
}

export function getComicHistory(
  comicId: number,
): Promise<ComicHistoryResult> {
  return clientApiGet(`/histories/comics/${comicId}`, comicHistoryResultSchema, {
    auth: true,
  });
}

export function deleteHistory(id: number): Promise<DeleteHistoryResult> {
  return clientApiDelete(`/histories/${id}`, deleteHistoryResultSchema, {
    auth: true,
  });
}
