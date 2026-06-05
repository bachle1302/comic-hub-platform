import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PresignedUploadFileDto } from './presigned-upload-file.dto';

export class CreatePresignedUploadDto {
  @IsString()
  @IsNotEmpty()
  comicSlug: string;

  @Type(() => Number)
  @IsNumber()
  chapterNumber: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PresignedUploadFileDto)
  files: PresignedUploadFileDto[];
}
