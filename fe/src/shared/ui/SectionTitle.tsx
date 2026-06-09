import type { ReactNode } from "react";

type SectionTitleProps = {
  action?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function SectionTitle({
  action,
  description,
  eyebrow,
  title,
}: SectionTitleProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 border-l-4 border-[#E53935] pl-3">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E53935]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-xl font-black uppercase tracking-wide text-zinc-900 dark:text-white md:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
