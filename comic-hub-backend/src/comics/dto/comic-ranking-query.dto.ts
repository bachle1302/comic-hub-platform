import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum ComicRankingType {
  HOT = 'hot',
  VIEWS = 'views',
  LIKES = 'likes',
  FOLLOWS = 'follows',
  LATEST = 'latest',
}

export enum ComicRankingPeriod {
  ALL = 'all',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class ComicRankingQueryDto {
  @IsOptional()
  @IsEnum(ComicRankingType)
  type?: ComicRankingType = ComicRankingType.HOT;

  @IsOptional()
  @IsEnum(ComicRankingPeriod)
  period?: ComicRankingPeriod = ComicRankingPeriod.ALL;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
