import { ContactTicketType } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateContactTicketDto {
  @IsEnum(ContactTicketType)
  type!: ContactTicketType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  relatedUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  orderCode?: string;
}
