import { clientApiGet } from "@/shared/api/client-api";
import { serverApiGet } from "@/shared/api/server-api";
import type { SearchComicsQuery, SearchSuggestion } from "./search.schema";
import {
  searchComicsResultSchema,
  searchSuggestionsSchema,
} from "./search.schema";

export function searchComics(query: SearchComicsQuery) {
  return serverApiGet("/search", searchComicsResultSchema, {
    revalidate: 30,
    tags: ["search", "comics"],
    query,
  });
}

export function getSearchSuggestions(
  query: string,
  limit = 8,
): Promise<SearchSuggestion[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return Promise.resolve([]);
  }

  const params = new URLSearchParams({
    q: normalizedQuery,
    limit: String(limit),
  });

  return clientApiGet(`/search/suggestions?${params.toString()}`, searchSuggestionsSchema);
}

