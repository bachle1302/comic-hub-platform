import { serverApiGet } from "@/shared/api/server-api";
import type { SearchComicsQuery } from "./search.schema";
import { searchComicsResultSchema } from "./search.schema";

export function searchComics(query: SearchComicsQuery) {
  return serverApiGet("/search", searchComicsResultSchema, {
    revalidate: 30,
    tags: ["search", "comics"],
    query,
  });
}

