import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = AuthenticatedUser>(
    error: Error | null,
    user: TUser | false | null,
  ): TUser | null {
    if (error || !user) {
      return null;
    }

    return user;
  }
}
