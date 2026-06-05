import { clientApiGet } from "@/shared/api/client-api";
import {
  protectedReaderSchema,
  type ProtectedReader,
} from "./protected-reader.schema";

export function getProtectedChapter(
  slug: string,
  chapterNumber: string | number,
): Promise<ProtectedReader> {
  return clientApiGet(
    `/reader/comics/${slug}/chapters/${chapterNumber}`,
    protectedReaderSchema,
    {
      auth: true,
    },
  );
}
