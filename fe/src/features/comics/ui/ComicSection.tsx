import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionTitle } from "@/shared/ui";
import type { Comic } from "../api/comics.schema";
import { ComicGrid } from "./ComicGrid";

type ComicSectionProps = {
  comics: Comic[];
  description?: string;
  href?: string;
  title: string;
};

export function ComicSection({
  comics,
  description,
  href,
  title,
}: ComicSectionProps) {
  return (
    <section className="space-y-5">
      <SectionTitle
        title={title}
        description={description}
        action={
          href ? (
            <Link
              href={href}
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 px-3.5 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-zinc-950 dark:hover:text-white transition-all"
            >
              Xem thêm
              <ArrowRight className="size-3.5" />
            </Link>
          ) : null
        }
      />
      <ComicGrid comics={comics} />
    </section>
  );
}
