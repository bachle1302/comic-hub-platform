import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAdminCategoryDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  slug?: string;
}
