import { serverApiGet } from "@/shared/api/server-api";
import { rankingsPaginatedSchema, type RankingQuery } from "./rankings.schema";

export function getComicRankings(query?: RankingQuery) {
  return serverApiGet("/comics/ranking", rankingsPaginatedSchema, {
    revalidate: 60,
    tags: ["comics", "comics-ranking"],
    query,
  });
}
