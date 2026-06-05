import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const MAX_IMAGE_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

type PresignedUploadInputFile = {
  fileName: string;
  contentType: string;
  size?: number;
  order?: number;
};

type CreatePresignedUploadUrlsInput = {
  comicSlug: string;
  chapterNumber: number;
  files: PresignedUploadInputFile[];
};

type CreatePresignedComicAvatarUploadInput = {
  comicSlug: string;
  file: PresignedUploadInputFile;
};

type PresignedUpload = {
  fileName: string;
  contentType: string;
  key: string;
  uploadUrl: string;
  publicUrl: string;
  order: number;
};

type CreatePresignedUploadUrlsOutput = {
  uploads: PresignedUpload[];
};

type CreatePresignedComicAvatarUploadOutput = {
  upload: PresignedUpload;
};

type CreatePresignedReadUrlInput = {
  expiresInSeconds?: number;
  key: string;
};

type StorageConfig = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl: string;
  forcePathStyle: boolean;
};

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}

  async createPresignedUploadUrls(
    input: CreatePresignedUploadUrlsInput,
  ): Promise<CreatePresignedUploadUrlsOutput> {
    const config = this.getStorageConfig();
    const client = this.createS3Client(config);

    const uploads = await Promise.all(
      input.files.map(async (file, index) => {
        this.validateFile(file);

        const order = file.order ?? index + 1;
        const paddedOrder = order.toString().padStart(3, '0');
        const fileName = file.fileName.trim();
        const key = `comics/${input.comicSlug}/chapters/${input.chapterNumber}/${paddedOrder}-${fileName}`;

        const command = new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          ContentType: file.contentType,
          ...(file.size === undefined ? {} : { ContentLength: file.size }),
        });

        const uploadUrl = await getSignedUrl(client, command, {
          expiresIn: 300,
        });

        return {
          fileName,
          contentType: file.contentType,
          key,
          uploadUrl,
          publicUrl: `${this.trimTrailingSlash(config.publicUrl)}/${key}`,
          order,
        };
      }),
    );

    return {
      uploads,
    };
  }

  async createPresignedComicAvatarUploadUrl(
    input: CreatePresignedComicAvatarUploadInput,
  ): Promise<CreatePresignedComicAvatarUploadOutput> {
    const config = this.getStorageConfig();
    const client = this.createS3Client(config);

    this.validateFile(input.file);

    const fileName = input.file.fileName.trim();
    const key = `comics/${input.comicSlug}/avatar/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ContentType: input.file.contentType,
      ...(input.file.size === undefined
        ? {}
        : { ContentLength: input.file.size }),
    });
    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: 300,
    });

    return {
      upload: {
        fileName,
        contentType: input.file.contentType,
        key,
        uploadUrl,
        publicUrl: `${this.trimTrailingSlash(config.publicUrl)}/${key}`,
        order: input.file.order ?? 1,
      },
    };
  }

  async createPresignedReadUrl(
    input: CreatePresignedReadUrlInput,
  ): Promise<string> {
    const key = input.key.trim();

    if (!key || key.includes('..') || key.startsWith('/')) {
      throw new BadRequestException('Invalid object key');
    }

    const config = this.getStorageConfig();
    const client = this.createS3Client(config);
    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    return getSignedUrl(client, command, {
      expiresIn:
        input.expiresInSeconds ??
        this.configService.get<number>('S3_SIGNED_READ_EXPIRES_SECONDS') ??
        300,
    });
  }

  isPrivateBucketMode(): boolean {
    return this.configService.get<string>('S3_PRIVATE_BUCKET_MODE') === 'true';
  }

  private createS3Client(config: StorageConfig): S3Client {
    return new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: config.forcePathStyle,
    });
  }

  private getStorageConfig(): StorageConfig {
    const endpoint = this.getRequiredEnv('S3_ENDPOINT');
    const bucket = this.getRequiredEnv('S3_BUCKET');
    const accessKeyId = this.getRequiredEnv('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.getRequiredEnv('S3_SECRET_ACCESS_KEY');
    const publicUrl = this.getRequiredEnv('S3_PUBLIC_URL');
    const region = this.configService.get<string>('S3_REGION') ?? 'auto';
    const forcePathStyle =
      this.configService.get<string>('S3_FORCE_PATH_STYLE') !== 'false';

    return {
      endpoint,
      region,
      bucket,
      accessKeyId,
      secretAccessKey,
      publicUrl,
      forcePathStyle,
    };
  }

  private getRequiredEnv(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new ServiceUnavailableException(
        `${key} environment variable is required for object storage upload`,
      );
    }

    return value;
  }

  private validateFile(file: PresignedUploadInputFile): void {
    const fileName = file.fileName.trim();

    if (
      !fileName ||
      fileName.includes('..') ||
      fileName.includes('/') ||
      fileName.includes('\\')
    ) {
      throw new BadRequestException('Invalid file name');
    }

    if (!ALLOWED_IMAGE_CONTENT_TYPES.has(file.contentType)) {
      throw new BadRequestException('Invalid image content type');
    }

    if (file.size !== undefined && file.size > MAX_IMAGE_UPLOAD_SIZE_BYTES) {
      throw new BadRequestException('Image file size must be 20MB or less');
    }
  }

  private trimTrailingSlash(value: string): string {
    return value.replace(/\/+$/, '');
  }
}
