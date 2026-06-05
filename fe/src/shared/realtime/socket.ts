import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/shared/config/env";
import {
  realtimeNotificationSchema,
  type RealtimeNotification,
} from "@/features/notifications/api/notifications.schema";

type NotificationServerEvents = {
  "notification:new": (notification: unknown) => void;
};

type NotificationClientEvents = Record<string, never>;

export type NotificationSocket = Socket<
  NotificationServerEvents,
  NotificationClientEvents
>;

type ConnectNotificationSocketInput = {
  token: string;
  onNewNotification: (notification: RealtimeNotification) => void;
  onError?: (message: string) => void;
};

export function connectNotificationSocket({
  token,
  onNewNotification,
  onError,
}: ConnectNotificationSocketInput): NotificationSocket {
  const socket: NotificationSocket = io(`${API_URL}/notifications`, {
    auth: { token },
    autoConnect: false,
    transports: ["websocket"],
  });

  socket.on("notification:new", (payload) => {
    const parsed = realtimeNotificationSchema.safeParse(payload);

    if (parsed.success) {
      onNewNotification(parsed.data);
    }
  });

  socket.on("connect_error", (error) => {
    onError?.(error.message);
  });

  socket.connect();

  return socket;
}
