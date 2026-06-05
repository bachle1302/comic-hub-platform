import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAdminAuthorDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  slug?: string;
}
