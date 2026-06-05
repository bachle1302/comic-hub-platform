import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAdminCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;
}
