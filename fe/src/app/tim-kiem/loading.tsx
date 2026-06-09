import { SectionHeader, SkeletonCard } from "@/shared/ui";

export default function SearchLoading() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Tìm kiếm" description="Đang tải kết quả..." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}
