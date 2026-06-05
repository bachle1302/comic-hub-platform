import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ChapterImageDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  key?: string;

  @Type(() => Number)
  @IsInt()
  order: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  width?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  height?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  size?: number;

  @IsString()
  @IsOptional()
  mimeType?: string;
}
