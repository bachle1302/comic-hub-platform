import { serverApiGet } from "@/shared/api/server-api";
import { clientApiGet } from "@/shared/api/client-api";
import {
  recommendationsResultSchema,
  type RecommendationsResult,
} from "./recommendations.schema";

// ---------------------------------------------------------------------------
// Cache TTLs (seconds)
// ---------------------------------------------------------------------------
const HOME_REVALIDATE = 300; // 5 min
const SIMILAR_REVALIDATE = 600; // 10 min

// ---------------------------------------------------------------------------
// Public — home fallback recommendations
// Used on homepage server component (ISR, no auth needed)
// ---------------------------------------------------------------------------
export async function getHomeRecommendations(
  limit = 12,
): Promise<RecommendationsResult> {
  return serverApiGet(
    "/recommendations/home",
    recommendationsResultSchema,
    {
      revalidate: HOME_REVALIDATE,
      query: { limit },
    },
  );
}

// ---------------------------------------------------------------------------
// Public — similar comics by slug
// Used on comic detail server component
// ---------------------------------------------------------------------------
export async function getSimilarComics(
  slug: string,
  limit = 12,
): Promise<RecommendationsResult> {
  return serverApiGet(
    `/recommendations/comics/${slug}/similar`,
    recommendationsResultSchema,
    {
      revalidate: SIMILAR_REVALIDATE,
      query: { limit },
    },
  );
}

// ---------------------------------------------------------------------------
// Protected (client-side) — personalized recommendations for logged-in user
// Called only when user is authenticated, from a Client Component
// ---------------------------------------------------------------------------
export async function getMyRecommendations(
  limit = 12,
): Promise<RecommendationsResult> {
  return clientApiGet(
    `/recommendations/me?limit=${limit}`,
    recommendationsResultSchema,
    { auth: true },
  );
}
