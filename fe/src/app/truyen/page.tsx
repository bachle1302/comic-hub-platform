import type { Metadata } from "next";
import { ComicGrid, getAllComics } from "@/features/comics";
import { PageContainer, SectionHeader } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Danh sách truyện - Đọc truyện tranh online",
  description:
    "Danh sách truyện tranh mới nhất, hot nhất và được cập nhật liên tục.",
};

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function ComicsPage() {
  const comics = await getAllComics();

  return (
    <PageContainer>
      <SectionHeader
        title="Danh sach truyen"
        description="Tat ca truyen dang public tren he thong, cap nhat lien tuc."
      />
      <ComicGrid comics={comics} />
    </PageContainer>
  );
}
