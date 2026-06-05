import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ComicStatus } from '@prisma/client';
import { ComicSort } from '../../search/dto/search-comics-query.dto';

export class AuthorComicsQueryDto {
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
