import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { PresignedUploadFileDto } from './presigned-upload-file.dto';

export class CreatePresignedComicAvatarUploadDto {
  @IsString()
  @IsNotEmpty()
  comicSlug: string;

  @ValidateNested()
  @Type(() => PresignedUploadFileDto)
  file: PresignedUploadFileDto;
}
