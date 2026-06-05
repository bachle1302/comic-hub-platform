import { ContactTicketStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateContactTicketDto {
  @IsOptional()
  @IsEnum(ContactTicketStatus)
  status?: ContactTicketStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  adminNote?: string;
}
