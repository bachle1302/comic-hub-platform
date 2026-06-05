export type ViewTargetTypeValue = 'COMIC' | 'CHAPTER';

export type TrackViewInput = {
  targetType: ViewTargetTypeValue;
  comicId?: number | null;
  chapterId?: number | null;
  userId?: number | null;
  ip?: string | null;
  userAgent?: string | null;
};
