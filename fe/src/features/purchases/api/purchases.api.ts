import { clientApiGet, clientApiPost } from "@/shared/api/client-api";
import {
  chapterAccessSchema,
  myPurchasesSchema,
  purchaseChapterResultSchema,
  type ChapterAccess,
  type MyPurchase,
  type PurchaseChapterResult,
} from "./purchases.schema";

export function purchaseChapter(
  chapterId: number,
): Promise<PurchaseChapterResult> {
  return clientApiPost(
    `/purchases/chapters/${chapterId}`,
    purchaseChapterResultSchema,
    undefined,
    {
      auth: true,
    },
  );
}

export function getChapterAccess(chapterId: number): Promise<ChapterAccess> {
  return clientApiGet(
    `/purchases/chapters/${chapterId}/access`,
    chapterAccessSchema,
    {
      auth: true,
    },
  );
}

export function getMyPurchases(): Promise<MyPurchase[]> {
  return clientApiGet("/purchases/me", myPurchasesSchema, {
    auth: true,
  });
}
