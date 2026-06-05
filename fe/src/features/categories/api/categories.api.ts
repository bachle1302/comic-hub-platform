import { serverApiGet } from "@/shared/api/server-api";
import type { CategoryComicsQuery } from "./categories.schema";
import {
  categoriesSchema,
  categoryComicsResultSchema,
} from "./categories.schema";

export function getCategories() {
  return serverApiGet("/categories", categoriesSchema, {
    revalidate: 300,
    tags: ["categories"],
  });
}

export function getCategoryComics(slug: string, query: CategoryComicsQuery) {
  return serverApiGet(`/categories/${slug}/comics`, categoryComicsResultSchema, {
    revalidate: 60,
    tags: ["categories", "comics", `category-${slug}`],
    query,
  });
}

