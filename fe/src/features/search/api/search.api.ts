import { serverApiGet } from "@/shared/api/server-api";
import { clientApiGet } from "@/shared/api/client-api";
import type { SearchComicsQuery, SearchSuggestion } from "./search.schema";
import { searchComicsResultSchema, searchSuggestionsSchema } from "./search.schema";

export function searchComics(query: SearchComicsQuery) {
  return serverApiGet("/search", searchComicsResultSchema, {
    revalidate: 30,
    tags: ["search", "comics"],
    query,
  });
}

export function getSearchSuggestions(query: string, limit = 8): Promise<SearchSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return Promise.resolve([]);
  }
  return clientApiGet(
    `/search/suggestions?q=${encodeURIComponent(trimmed)}&limit=${limit}`,
    searchSuggestionsSchema,
  );
}


