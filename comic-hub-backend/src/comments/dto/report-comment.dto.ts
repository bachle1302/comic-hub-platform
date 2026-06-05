import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ReportCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  reason: string;
}
