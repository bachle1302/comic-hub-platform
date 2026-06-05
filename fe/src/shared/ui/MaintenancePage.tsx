import Link from "next/link";

import { Button } from "@/components/ui/button";

type MaintenancePageProps = {
  message?: string;
};

const DEFAULT_MESSAGE =
  "Website đang bảo trì để nâng cấp trải nghiệm đọc truyện.";

export function MaintenancePage({ message }: MaintenancePageProps) {
  const displayMessage = message?.trim() || DEFAULT_MESSAGE;

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-5 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
        Bảo trì hệ thống
      </div>
      <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
        Website đang bảo trì
      </h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
        {displayMessage}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Vui lòng quay lại sau.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/login">Đăng nhập quản trị</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Thử lại trang chủ</Link>
        </Button>
      </div>
    </section>
  );
}
