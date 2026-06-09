import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

type CategoryRef = {
  id: number;
  name: string;
  slug: string;
};

type AuthorRef = {
  id: number;
  name: string;
  slug: string;
} | null;

type ChapterSummary = {
  chapterNumber: number;
};

type CandidateComic = {
  id: number;
  name: string;
  slug: string;
  thumbnail: string | null;
  status: string;
  viewTotal: number;
  followCount: number;
  lastChapterAt: Date | null;
  author: AuthorRef;
  categories: Array<{ category: CategoryRef }>;
  _count: { likes: number };
  chapters: ChapterSummary[];
};

export type RecommendationItem = {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  status: string;
  authorName: string | null;
  categories: CategoryRef[];
  latestChapterNumber: number | null;
  viewTotal: number;
  followCount: number;
  likeCount: number;
  score: number;
  reasons: string[];
};

type RecommendationsResult = {
  items: RecommendationItem[];
  meta: { total: number; limit: number };
};

// ---------------------------------------------------------------------------
// User profile aggregated from behavior signals
// ---------------------------------------------------------------------------

type UserProfile = {
  categoryScore: Map<number, number>;
  authorScore: Map<number, number>;
  readComicIds: Set<number>;
  followedComicIds: Set<number>;
  purchasedComicIds: Set<number>;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CANDIDATE_TAKE = 150;
const BEHAVIOR_LIMIT = 100;
const RECENT_DAYS = 7;
const HOT_FOLLOW_THRESHOLD = 500;
const HOT_LIKE_THRESHOLD = 200;

const HOME_TTL = 300;
const USER_TTL = 300;
const SIMILAR_TTL = 600;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isRecentlyUpdated(date: Date | null): boolean {
  if (!date) return false;
  const diffMs = Date.now() - date.getTime();
  return diffMs < RECENT_DAYS * 24 * 60 * 60 * 1000;
}

function buildItem(
  comic: CandidateComic,
  score: number,
  reasons: string[],
): RecommendationItem {
  return {
    id: comic.id,
    title: comic.name,
    slug: comic.slug,
    thumbnail: comic.thumbnail,
    status: comic.status,
    authorName: comic.author?.name ?? null,
    categories: comic.categories.map((c) => c.category),
    latestChapterNumber: comic.chapters[0]?.chapterNumber ?? null,
    viewTotal: comic.viewTotal,
    followCount: comic.followCount,
    likeCount: comic._count.likes,
    score,
    reasons: reasons.slice(0, 3),
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // -------------------------------------------------------------------------
  // Public: home recommendations (popular fallback)
  // -------------------------------------------------------------------------

  async getHomeRecommendations(limit: number): Promise<RecommendationsResult> {
    const cacheKey = `recommendations:home:${limit}`;
    const cached = await this.redis.get<RecommendationsResult>(cacheKey);
    if (cached) return cached;

    const candidates = await this.fetchCandidates();
    const scored = candidates.map((comic) => this.scoreForFallback(comic));
    scored.sort((a, b) => b.score - a.score);
    const items = scored.slice(0, limit);
    const result: RecommendationsResult = {
      items,
      meta: { total: items.length, limit },
    };

    await this.redis.set(cacheKey, result, HOME_TTL);
    return result;
  }

  // -------------------------------------------------------------------------
  // Protected: personalized recommendations for a logged-in user
  // -------------------------------------------------------------------------

  async getUserRecommendations(
    userId: number,
    limit: number,
  ): Promise<RecommendationsResult> {
    const cacheKey = `recommendations:user:${userId}:${limit}`;
    const cached = await this.redis.get<RecommendationsResult>(cacheKey);
    if (cached) return cached;

    const [candidates, profile] = await Promise.all([
      this.fetchCandidates(),
      this.buildUserProfile(userId),
    ]);

    const scored = candidates.map((comic) => this.scoreForUser(comic, profile));
    scored.sort((a, b) => b.score - a.score);
    const items = scored.slice(0, limit);
    const result: RecommendationsResult = {
      items,
      meta: { total: items.length, limit },
    };

    await this.redis.set(cacheKey, result, USER_TTL);
    return result;
  }

  // -------------------------------------------------------------------------
  // Public: similar comics by slug
  // -------------------------------------------------------------------------

  async getSimilarComics(
    slug: string,
    limit: number,
  ): Promise<RecommendationsResult> {
    const cacheKey = `recommendations:similar:${slug}:${limit}`;
    const cached = await this.redis.get<RecommendationsResult>(cacheKey);
    if (cached) return cached;

    const source = await this.prisma.comic.findUnique({
      where: { slug },
      select: {
        id: true,
        author: { select: { id: true } },
        categories: { select: { categoryId: true } },
      },
    });

    if (!source) {
      const empty: RecommendationsResult = {
        items: [],
        meta: { total: 0, limit },
      };
      await this.redis.set(cacheKey, empty, SIMILAR_TTL);
      return empty;
    }

    const sourceCategoryIds = new Set(
      source.categories.map((c) => c.categoryId),
    );
    const sourceAuthorId = source.author?.id ?? null;

    const candidates = await this.fetchCandidates();
    const scored = candidates
      .filter((c) => c.id !== source.id)
      .map((comic) =>
        this.scoreForSimilar(comic, sourceCategoryIds, sourceAuthorId),
      );
    scored.sort((a, b) => b.score - a.score);
    const items = scored.slice(0, limit);
    const result: RecommendationsResult = {
      items,
      meta: { total: items.length, limit },
    };

    await this.redis.set(cacheKey, result, SIMILAR_TTL);
    return result;
  }

  // -------------------------------------------------------------------------
  // Candidate query — single batched query, no N+1
  // -------------------------------------------------------------------------

  private async fetchCandidates(): Promise<CandidateComic[]> {
    const rows = await this.prisma.comic.findMany({
      where: {
        isPublic: true,
        deletedAt: null,
      },
      orderBy: [{ lastChapterAt: 'desc' }, { viewTotal: 'desc' }],
      take: CANDIDATE_TAKE,
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnail: true,
        status: true,
        viewTotal: true,
        followCount: true,
        lastChapterAt: true,
        author: {
          select: { id: true, name: true, slug: true },
        },
        categories: {
          select: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
        _count: {
          select: { likes: true },
        },
        chapters: {
          where: { isPublic: true, deletedAt: null },
          orderBy: { chapterNumber: 'desc' },
          take: 1,
          select: { chapterNumber: true },
        },
      },
    });

    return rows;
  }

  // -------------------------------------------------------------------------
  // Build user profile — all parallel queries, no N+1
  // -------------------------------------------------------------------------

  private async buildUserProfile(userId: number): Promise<UserProfile> {
    const [histories, follows, likes, purchases, comments] = await Promise.all([
      // Reading histories — one row per comic, latest first
      this.prisma.history.findMany({
        where: { userId },
        take: BEHAVIOR_LIMIT,
        orderBy: { updatedAt: 'desc' },
        select: {
          comicId: true,
          comic: {
            select: {
              author: { select: { id: true } },
              categories: { select: { categoryId: true } },
            },
          },
        },
      }),
      // Follows
      this.prisma.follow.findMany({
        where: { userId },
        take: BEHAVIOR_LIMIT,
        orderBy: { createdAt: 'desc' },
        select: {
          comicId: true,
          comic: {
            select: {
              author: { select: { id: true } },
              categories: { select: { categoryId: true } },
            },
          },
        },
      }),
      // Comic likes by userId (ComicLike has nullable userId; filter for real user)
      this.prisma.comicLike.findMany({
        where: { userId },
        take: BEHAVIOR_LIMIT,
        select: {
          comicId: true,
          comic: {
            select: {
              author: { select: { id: true } },
              categories: { select: { categoryId: true } },
            },
          },
        },
      }),
      // Purchases — traversed through chapter to get comicId
      this.prisma.purchase.findMany({
        where: { userId },
        take: BEHAVIOR_LIMIT,
        orderBy: { createdAt: 'desc' },
        select: {
          chapter: {
            select: {
              comicId: true,
              comic: {
                select: {
                  author: { select: { id: true } },
                  categories: { select: { categoryId: true } },
                },
              },
            },
          },
        },
      }),
      // Comments — use comicId directly from Comment model
      this.prisma.comment.findMany({
        where: { userId, deletedAt: null },
        take: BEHAVIOR_LIMIT,
        orderBy: { createdAt: 'desc' },
        select: { comicId: true },
      }),
    ]);

    const categoryScore = new Map<number, number>();
    const authorScore = new Map<number, number>();
    const readComicIds = new Set<number>();
    const followedComicIds = new Set<number>();
    const purchasedComicIds = new Set<number>();

    // Helper to accumulate scores
    const addCategoryScore = (categoryId: number, delta: number) => {
      categoryScore.set(
        categoryId,
        (categoryScore.get(categoryId) ?? 0) + delta,
      );
    };
    const addAuthorScore = (authorId: number, delta: number) => {
      authorScore.set(authorId, (authorScore.get(authorId) ?? 0) + delta);
    };

    // Reading history → +8 category, +18 author
    for (const h of histories) {
      readComicIds.add(h.comicId);
      for (const cc of h.comic.categories) {
        addCategoryScore(cc.categoryId, 8);
      }
      if (h.comic.author) {
        addAuthorScore(h.comic.author.id, 18);
      }
    }

    // Follows → +25 category, +18 author
    for (const f of follows) {
      followedComicIds.add(f.comicId);
      for (const cc of f.comic.categories) {
        addCategoryScore(cc.categoryId, 25);
      }
      if (f.comic.author) {
        addAuthorScore(f.comic.author.id, 18);
      }
    }

    // Likes → +5 category
    for (const lk of likes) {
      for (const cc of lk.comic.categories) {
        addCategoryScore(cc.categoryId, 5);
      }
    }

    // Purchases → +25 category, +18 author
    for (const p of purchases) {
      if (!p.chapter) continue;
      purchasedComicIds.add(p.chapter.comicId);
      for (const cc of p.chapter.comic.categories) {
        addCategoryScore(cc.categoryId, 25);
      }
      if (p.chapter.comic.author) {
        addAuthorScore(p.chapter.comic.author.id, 18);
      }
    }

    // Comments → +5 category (use comicId directly)
    for (const c of comments) {
      // We only have comicId here; fetch category score contribution
      // is handled via history/follows overlapping — no extra query needed.
      // Just track commented comics to avoid re-recommending too eagerly.
      readComicIds.add(c.comicId);
    }

    return {
      categoryScore,
      authorScore,
      readComicIds,
      followedComicIds,
      purchasedComicIds,
    };
  }

  // -------------------------------------------------------------------------
  // Scoring functions
  // -------------------------------------------------------------------------

  private scoreForFallback(comic: CandidateComic): RecommendationItem {
    let score = 0;
    const reasons: string[] = [];

    if (comic.followCount > HOT_FOLLOW_THRESHOLD) {
      score += 15;
      reasons.push('Truyện đang được nhiều người theo dõi');
    }

    if (isRecentlyUpdated(comic.lastChapterAt)) {
      score += 10;
      reasons.push('Mới cập nhật chương gần đây');
    }

    if (comic._count.likes > HOT_LIKE_THRESHOLD) {
      score += 5;
      reasons.push('Được nhiều người thích');
    }

    score += Math.min(Math.floor(comic.viewTotal / 1000), 10);

    if (reasons.length === 0) {
      reasons.push('Truyện đang phổ biến');
    }

    return buildItem(comic, score, reasons);
  }

  private scoreForUser(
    comic: CandidateComic,
    profile: UserProfile,
  ): RecommendationItem {
    let score = 0;
    const reasons: string[] = [];

    const comicCategoryIds = comic.categories.map((c) => c.category.id);
    const comicAuthorId = comic.author?.id ?? null;

    // Best matching category score
    let maxCategoryScore = 0;
    let bestCategoryName = '';
    for (const catId of comicCategoryIds) {
      const s = profile.categoryScore.get(catId) ?? 0;
      if (s > maxCategoryScore) {
        maxCategoryScore = s;
        bestCategoryName =
          comic.categories.find((c) => c.category.id === catId)?.category
            .name ?? '';
      }
    }

    if (maxCategoryScore >= 25) {
      score += 25;
      reasons.push(`Cùng thể loại bạn hay đọc: ${bestCategoryName}`);
    } else if (maxCategoryScore >= 8) {
      score += 8;
      reasons.push('Phù hợp với lịch sử đọc gần đây của bạn');
    }

    // Author score
    if (comicAuthorId !== null) {
      const authorSc = profile.authorScore.get(comicAuthorId) ?? 0;
      if (authorSc >= 18) {
        score += 18;
        if (reasons.length < 3) {
          reasons.push('Cùng tác giả với truyện bạn theo dõi');
        }
      }
    }

    // Hot by follows
    if (comic.followCount > HOT_FOLLOW_THRESHOLD) {
      score += 15;
      if (reasons.length < 3) {
        reasons.push('Truyện đang được theo dõi nhiều');
      }
    }

    // Recent update
    if (isRecentlyUpdated(comic.lastChapterAt)) {
      score += 10;
      if (reasons.length < 3) {
        reasons.push('Mới cập nhật chương gần đây');
      }
    }

    // Likes
    if (comic._count.likes > HOT_LIKE_THRESHOLD) {
      score += 5;
    }

    // Penalty: user already interacted with this comic
    if (
      profile.readComicIds.has(comic.id) ||
      profile.followedComicIds.has(comic.id)
    ) {
      score -= 20;
    }

    if (reasons.length === 0) {
      reasons.push('Truyện đang phổ biến');
    }

    return buildItem(comic, score, reasons);
  }

  private scoreForSimilar(
    comic: CandidateComic,
    sourceCategoryIds: Set<number>,
    sourceAuthorId: number | null,
  ): RecommendationItem {
    let score = 0;
    const reasons: string[] = [];

    const comicCategoryIds = comic.categories.map((c) => c.category.id);

    // Shared categories
    const hasSharedCategory = comicCategoryIds.some((id) =>
      sourceCategoryIds.has(id),
    );
    if (hasSharedCategory) {
      score += 30;
      const catName =
        comic.categories.find((c) => sourceCategoryIds.has(c.category.id))
          ?.category.name ?? '';
      reasons.push(`Cùng thể loại: ${catName}`);
    }

    // Same author
    if (sourceAuthorId !== null && comic.author?.id === sourceAuthorId) {
      score += 20;
      if (reasons.length < 3) reasons.push('Cùng tác giả');
    }

    // Popularity
    if (comic.followCount > 200) {
      score += 10;
      if (reasons.length < 3) reasons.push('Được nhiều người theo dõi');
    }

    // Recent update
    if (isRecentlyUpdated(comic.lastChapterAt)) {
      score += 10;
      if (reasons.length < 3) reasons.push('Mới cập nhật chương gần đây');
    }

    if (reasons.length === 0) {
      reasons.push('Truyện tương tự');
    }

    return buildItem(comic, score, reasons);
  }
}
