import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SearchSuggestionsQueryDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  q?: string;

  @Transform(({ value }: TransformFnParams) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return value as unknown;
    }

    return Math.min(parsed, 10);
  })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  limit?: number;
}
