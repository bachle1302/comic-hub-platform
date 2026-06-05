import {
  clientApiDelete,
  clientApiGet,
  clientApiPatch,
  clientApiPost,
} from "@/shared/api/client-api";
import {
  announcementSchema,
  announcementsPaginatedSchema,
  broadcastAnnouncementResultSchema,
  deleteAnnouncementResultSchema,
  type ActiveAnnouncementsQuery,
  type AdminAnnouncementsQuery,
  type Announcement,
  type AnnouncementInput,
  type AnnouncementsPaginated,
  type BroadcastAnnouncementResult,
  type DeleteAnnouncementResult,
  type UpdateAnnouncementInput,
} from "./announcements.schema";
import { z } from "zod";

const activeAnnouncementsSchema = z.array(announcementSchema);

function buildQueryString(
  query?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function getActiveAnnouncements(
  query?: ActiveAnnouncementsQuery,
): Promise<Announcement[]> {
  return clientApiGet(
    `/announcements/active${buildQueryString(query)}`,
    activeAnnouncementsSchema,
  );
}

export function getAdminAnnouncements(
  query?: AdminAnnouncementsQuery,
): Promise<AnnouncementsPaginated> {
  return clientApiGet(
    `/admin/announcements${buildQueryString(query)}`,
    announcementsPaginatedSchema,
    {
      auth: true,
    },
  );
}

export function getAdminAnnouncement(id: number): Promise<Announcement> {
  return clientApiGet(`/admin/announcements/${id}`, announcementSchema, {
    auth: true,
  });
}

export function createAdminAnnouncement(
  input: AnnouncementInput,
): Promise<Announcement> {
  return clientApiPost("/admin/announcements", announcementSchema, input, {
    auth: true,
  });
}

export function updateAdminAnnouncement(
  id: number,
  input: UpdateAnnouncementInput,
): Promise<Announcement> {
  return clientApiPatch(
    `/admin/announcements/${id}`,
    announcementSchema,
    input,
    {
      auth: true,
    },
  );
}

export function deleteAdminAnnouncement(
  id: number,
): Promise<DeleteAnnouncementResult> {
  return clientApiDelete(
    `/admin/announcements/${id}`,
    deleteAnnouncementResultSchema,
    {
      auth: true,
    },
  );
}

export function broadcastAdminAnnouncement(
  id: number,
): Promise<BroadcastAnnouncementResult> {
  return clientApiPost(
    `/admin/announcements/${id}/broadcast`,
    broadcastAnnouncementResultSchema,
    undefined,
    {
      auth: true,
    },
  );
}
