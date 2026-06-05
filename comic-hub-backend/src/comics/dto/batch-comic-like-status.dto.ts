import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt } from 'class-validator';

export class BatchComicLikeStatusDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @Type(() => Number)
  @IsInt({ each: true })
  comicIds!: number[];
}
