import { EmptyState } from "@/shared/ui";
import type { Comic } from "../api/comics.schema";
import { ComicCard } from "./ComicCard";

type ComicGridProps = {
  comics: Comic[];
};

export function ComicGrid({ comics }: ComicGridProps) {
  if (comics.length === 0) {
    return (
      <EmptyState
        title="Khong co truyen de hien thi"
        description="Thu thay doi bo loc hoac quay lai sau khi co noi dung moi."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
      {comics.map((comic) => (
        <ComicCard key={comic.id} comic={comic} />
      ))}
    </div>
  );
}
