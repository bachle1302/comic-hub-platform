import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AnnouncementTarget, AnnouncementType } from '@prisma/client';

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  message?: string;

  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType;

  @IsOptional()
  @IsEnum(AnnouncementTarget)
  target?: AnnouncementTarget;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  linkLabel?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @IsOptional()
  @IsISO8601()
  endsAt?: string;
}
