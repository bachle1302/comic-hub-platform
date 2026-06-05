import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

function transformOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

export class ListSystemSettingsQueryDto {
  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => transformOptionalBoolean(value))
  @IsBoolean()
  isPublic?: boolean;
}
