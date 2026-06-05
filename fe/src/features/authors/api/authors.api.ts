import { serverApiGet } from "@/shared/api/server-api";
import type { AuthorComicsQuery } from "./authors.schema";
import { authorComicsResultSchema } from "./authors.schema";

export function getAuthorComics(slug: string, query: AuthorComicsQuery) {
  return serverApiGet(`/authors/${slug}/comics`, authorComicsResultSchema, {
    revalidate: 60,
    tags: ["authors", "comics", `author-${slug}`],
    query,
  });
}

