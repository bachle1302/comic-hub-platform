import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpsertHistoryDto {
  @Type(() => Number)
  @IsInt()
  comicId: number;

  @Type(() => Number)
  @IsInt()
  chapterId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  imageIndex?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  progress?: number = 0;
}
