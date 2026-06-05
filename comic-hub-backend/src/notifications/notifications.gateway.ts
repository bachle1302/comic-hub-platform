import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export type NotificationPayload = {
  id: number;
  type: 'NEW_CHAPTER' | 'COMMENT' | 'REPLY_COMMENT' | 'SYSTEM';
  title: string;
  message: string | null;
  url: string | null;
  isRead: boolean;
  createdAt: string;
};

type ServerToClientEvents = {
  'notification:new': (payload: NotificationPayload) => void;
};

type ClientToServerEvents = Record<string, never>;
type InterServerEvents = Record<string, never>;

type NotificationSocketData = {
  userId?: number;
};

type NotificationSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  NotificationSocketData
>;

type NotificationServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  NotificationSocketData
>;

type JwtAccessPayload = {
  sub: number;
};

function parseCorsOriginsFromEnv(): string[] {
  const corsOrigins = process.env.CORS_ORIGINS;
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const origins = corsOrigins
    ? corsOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [frontendUrl];

  if (process.env.NODE_ENV !== 'production') {
    return Array.from(new Set([...origins, 'http://localhost:3000']));
  }

  return origins;
}

function isAllowedOrigin(
  origin: string | undefined,
  callback: (error: Error | null, success?: boolean) => void,
) {
  if (!origin) {
    callback(null, true);
    return;
  }

  callback(null, parseCorsOriginsFromEnv().includes(origin));
}

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: isAllowedOrigin,
    credentials: true,
  },
})
export class NotificationsGateway
  implements
    OnGatewayConnection<NotificationSocket>,
    OnGatewayDisconnect<NotificationSocket>
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  private server!: NotificationServer;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(@ConnectedSocket() socket: NotificationSocket) {
    const token = this.extractHandshakeToken(socket);

    if (!token) {
      socket.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify<JwtAccessPayload>(token, {
        secret:
          this.configService.get<string>('JWT_ACCESS_SECRET') ??
          'access_secret_manga_web',
      });

      socket.data.userId = payload.sub;
      void socket.join(this.userRoom(payload.sub));
    } catch {
      socket.disconnect(true);
    }
  }

  handleDisconnect(@ConnectedSocket() socket: NotificationSocket) {
    if (socket.data.userId) {
      this.logger.debug(
        `Notification socket disconnected user:${socket.data.userId}`,
      );
    }
  }

  emitNotificationToUser(
    userId: number,
    notification: NotificationPayload,
  ): void {
    try {
      this.server
        .to(this.userRoom(userId))
        .emit('notification:new', notification);
    } catch (error) {
      this.logger.warn(
        error instanceof Error
          ? `Failed to emit notification: ${error.message}`
          : 'Failed to emit notification',
      );
    }
  }

  private extractHandshakeToken(socket: NotificationSocket): string | null {
    const authPayload = socket.handshake.auth as unknown;

    if (
      typeof authPayload !== 'object' ||
      authPayload === null ||
      !('token' in authPayload)
    ) {
      return null;
    }

    const token = authPayload.token;

    return typeof token === 'string' && token.length > 0 ? token : null;
  }

  private userRoom(userId: number): string {
    return `user:${userId}`;
  }
}
