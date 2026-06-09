import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { Role } from '@prisma/client';

// ---------------------------------------------------------------------------
// Mock service
// ---------------------------------------------------------------------------

const mockResult = {
  items: [
    {
      id: 1,
      title: 'Test Comic',
      slug: 'test-comic',
      thumbnail: null,
      status: 'ONGOING',
      authorName: 'Author A',
      categories: [{ id: 1, name: 'Action', slug: 'action' }],
      latestChapterNumber: 5,
      viewTotal: 100,
      followCount: 20,
      likeCount: 10,
      score: 42,
      reasons: ['Truyện đang phổ biến'],
    },
  ],
  meta: { total: 1, limit: 12 },
};

const mockService: Partial<RecommendationsService> = {
  getHomeRecommendations: jest.fn().mockResolvedValue(mockResult),
  getUserRecommendations: jest.fn().mockResolvedValue(mockResult),
  getSimilarComics: jest.fn().mockResolvedValue(mockResult),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeUser = (): AuthenticatedUser => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: Role.USER,
  avatar: null,
  coin: 0,
  createdAt: new Date(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RecommendationsController', () => {
  let controller: RecommendationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationsController],
      providers: [{ provide: RecommendationsService, useValue: mockService }],
    }).compile();

    controller = module.get<RecommendationsController>(
      RecommendationsController,
    );
  });

  describe('getHome', () => {
    it('calls getHomeRecommendations with default limit', async () => {
      const result = await controller.getHome({});

      expect(mockService.getHomeRecommendations).toHaveBeenCalledWith(12);
      expect(result.items).toHaveLength(1);
    });

    it('calls getHomeRecommendations with provided limit', async () => {
      await controller.getHome({ limit: 5 });

      expect(mockService.getHomeRecommendations).toHaveBeenCalledWith(5);
    });
  });

  describe('getMe', () => {
    it('calls getUserRecommendations with userId and default limit', async () => {
      const user = makeUser();
      const result = await controller.getMe(user, {});

      expect(mockService.getUserRecommendations).toHaveBeenCalledWith(
        user.id,
        12,
      );
      expect(result.items).toHaveLength(1);
    });
  });

  describe('getSimilar', () => {
    it('calls getSimilarComics with slug and limit', async () => {
      const result = await controller.getSimilar('one-piece', { limit: 6 });

      expect(mockService.getSimilarComics).toHaveBeenCalledWith('one-piece', 6);
      expect(result.items).toHaveLength(1);
    });
  });
});
