import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCoinPackageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  coin: number;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bonusCoin?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}
