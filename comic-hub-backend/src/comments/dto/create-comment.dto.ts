import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  comicId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  chapterId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentId?: number;
}
