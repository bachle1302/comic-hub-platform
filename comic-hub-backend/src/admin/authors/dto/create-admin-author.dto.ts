import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAdminAuthorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;
}
