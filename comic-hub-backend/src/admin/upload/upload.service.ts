import { Injectable } from '@nestjs/common';
import { CreatePresignedComicAvatarUploadDto } from '../../storage/dto/create-presigned-comic-avatar-upload.dto';
import { CreatePresignedUploadDto } from '../../storage/dto/create-presigned-upload.dto';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class UploadService {
  constructor(private readonly storageService: StorageService) {}

  async createPresignedUrls(dto: CreatePresignedUploadDto) {
    const { uploads } =
      await this.storageService.createPresignedUploadUrls(dto);

    return {
      message: 'Presigned upload URLs created successfully',
      uploads,
    };
  }

  async createComicAvatarPresignedUrl(
    dto: CreatePresignedComicAvatarUploadDto,
  ) {
    const { upload } =
      await this.storageService.createPresignedComicAvatarUploadUrl(dto);

    return {
      message: 'Comic avatar presigned upload URL created successfully',
      upload,
    };
  }
}
