import { IsIn, IsOptional } from 'class-validator';

export type BroadcastAnnouncementTarget = 'ALL' | 'AUTHENTICATED';

const BROADCAST_ANNOUNCEMENT_TARGETS: BroadcastAnnouncementTarget[] = [
  'ALL',
  'AUTHENTICATED',
];

export class BroadcastAnnouncementDto {
  @IsOptional()
  @IsIn(BROADCAST_ANNOUNCEMENT_TARGETS)
  target?: BroadcastAnnouncementTarget;
}
