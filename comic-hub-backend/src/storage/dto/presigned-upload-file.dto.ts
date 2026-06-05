import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const MAX_IMAGE_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export class PresignedUploadFileDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_IMAGE_CONTENT_TYPES)
  contentType: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_IMAGE_UPLOAD_SIZE_BYTES)
  @IsOptional()
  size?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;
}
