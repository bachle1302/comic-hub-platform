import type { ReactNode } from "react";

type LegalPageLayoutProps = {
  title: string;
  description?: string;
  updatedAt?: string;
  children: ReactNode;
};

export function LegalPageLayout({
  title,
  description,
  updatedAt,
  children,
}: LegalPageLayoutProps) {
  return (
    <article className="mx-auto max-w-3xl space-y-8 py-4">
      <header className="space-y-3 border-b pb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Chính sách vận hành
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="text-base leading-7 text-muted-foreground">
            {description}
          </p>
        ) : null}
        {updatedAt ? (
          <p className="text-sm text-muted-foreground">
            Cập nhật lần cuối: {updatedAt}
          </p>
        ) : null}
      </header>

      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
        Tài liệu này là bản mẫu vận hành sản phẩm, không phải tư vấn pháp lý.
        Chủ site cần rà soát pháp lý trước khi public thật.
      </div>

      <div className="space-y-7 text-sm leading-7 text-foreground md:text-base">
        {children}
      </div>
    </article>
  );
}

