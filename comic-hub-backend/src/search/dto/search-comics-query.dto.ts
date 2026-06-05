import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ComicStatus } from '@prisma/client';

export enum ComicSort {
  Latest = 'latest',
  Hot = 'hot',
  Newest = 'newest',
  Name = 'name',
}

export class SearchComicsQueryDto {
  @IsString()
  @IsOptional()
  q?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(ComicStatus)
  @IsOptional()
  status?: ComicStatus;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;

  @IsEnum(ComicSort)
  @IsOptional()
  sort?: ComicSort;
}
