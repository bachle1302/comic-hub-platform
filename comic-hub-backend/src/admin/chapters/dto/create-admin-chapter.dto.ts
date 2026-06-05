import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ChapterImageDto } from './chapter-image.dto';

export class CreateAdminChapterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  chapterNumber: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChapterImageDto)
  @IsOptional()
  images?: ChapterImageDto[];
}
