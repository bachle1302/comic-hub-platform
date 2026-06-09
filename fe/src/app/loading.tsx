import { SectionHeader, SkeletonCard } from "@/shared/ui";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Đang tải nội dung"
        description="Vui lòng đợi trong giây lát."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}
