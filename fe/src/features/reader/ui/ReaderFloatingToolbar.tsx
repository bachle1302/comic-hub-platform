"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  RotateCcw,
  ArrowUp,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import {
  followComic,
  getFollowStatus,
  unfollowComic,
} from "@/features/follows/api/follows.api";
import type { ChapterNavigationItem } from "../api/reader.schema";

type ReaderFloatingToolbarProps = {
  comicId: number;
  comicSlug: string;
  currentChapterName: string;
  currentChapterNumber: number;
  nextChapter: ChapterNavigationItem | null;
  previousChapter: ChapterNavigationItem | null;
};

type ChapterOption = {
  href: string;
  label: string;
  value: string;
};

function chapterHref(comicSlug: string, chapterNumber: number): string {
  return `/truyen/${comicSlug}/chapter/${chapterNumber}`;
}

function getChapterLabel(chapterNumber: number): string {
  return `Chương ${chapterNumber}`;
}

export function ReaderFloatingToolbar({
  comicId,
  comicSlug,
  currentChapterName,
  currentChapterNumber,
  nextChapter,
  previousChapter,
}: ReaderFloatingToolbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowBusy, setIsFollowBusy] = useState(false);
  const lastScrollYRef = useRef(0);

  const chapterOptions = useMemo<ChapterOption[]>(() => {
    const options: ChapterOption[] = [];

    if (previousChapter) {
      options.push({
        href: chapterHref(comicSlug, previousChapter.chapterNumber),
        label: getChapterLabel(previousChapter.chapterNumber),
        value: String(previousChapter.chapterNumber),
      });
    }

    options.push({
      href: chapterHref(comicSlug, currentChapterNumber),
      label: getChapterLabel(currentChapterNumber),
      value: String(currentChapterNumber),
    });

    if (nextChapter) {
      options.push({
        href: chapterHref(comicSlug, nextChapter.chapterNumber),
        label: getChapterLabel(nextChapter.chapterNumber),
        value: String(nextChapter.chapterNumber),
      });
    }

    return options;
  }, [comicSlug, currentChapterNumber, nextChapter, previousChapter]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      const task = window.setTimeout(() => setIsFollowing(false), 0);
      return () => window.clearTimeout(task);
    }

    const task = window.setTimeout(() => {
      void getFollowStatus(comicId)
        .then((status) => setIsFollowing(status.isFollowing))
        .catch(() => setIsFollowing(false));
    }, 0);

    return () => window.clearTimeout(task);
  }, [comicId, isAuthenticated, isLoading]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;

      if (!isDesktop) {
        setIsVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY < 120) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + 8) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 8) {
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleFollowClick() {
    if (isLoading || isFollowBusy) {
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsFollowBusy(true);

    try {
      if (isFollowing) {
        await unfollowComic(comicId);
        setIsFollowing(false);
      } else {
        await followComic(comicId);
        setIsFollowing(true);
      }
    } finally {
      setIsFollowBusy(false);
    }
  }

  function handleChapterChange(value: string) {
    const option = chapterOptions.find((item) => item.value === value);

    if (option && value !== String(currentChapterNumber)) {
      router.push(option.href);
    }
  }

  function scrollToTop() {
    window.scrollTo({
      behavior: "smooth",
      top: 0,
    });
    setIsVisible(true);
  }

  const previousHref = previousChapter
    ? chapterHref(comicSlug, previousChapter.chapterNumber)
    : null;
  const nextHref = nextChapter
    ? chapterHref(comicSlug, nextChapter.chapterNumber)
    : null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#111324]/95 px-3 py-2 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] backdrop-blur transition-transform duration-300 md:py-2.5 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <nav
        aria-label="Điều hướng đọc truyện"
        className="mx-auto flex max-w-5xl items-center justify-center gap-2 overflow-x-auto"
      >
        <Link
          href="/"
          prefetch={false}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Về trang chủ"
        >
          <Home className="size-4" />
        </Link>

        <Link
          href={`/truyen/${comicSlug}`}
          prefetch={false}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Quay lại trang truyện"
        >
          <RotateCcw className="size-4" />
        </Link>

        <button
          type="button"
          onClick={scrollToTop}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Lên đầu trang"
        >
          <ArrowUp className="size-4" />
        </button>

        {previousHref ? (
          <Link
            href={previousHref}
            prefetch={false}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-indigo-500 text-white transition hover:bg-indigo-400"
            aria-label="Chương trước"
          >
            <ChevronLeft className="size-5" />
          </Link>
        ) : (
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white/35">
            <ChevronLeft className="size-5" />
          </span>
        )}

        <label className="sr-only" htmlFor="reader-chapter-select">
          Chọn chương
        </label>
        <select
          id="reader-chapter-select"
          value={String(currentChapterNumber)}
          onChange={(event) => handleChapterChange(event.target.value)}
          title={currentChapterName}
          className="h-9 max-w-[150px] shrink-0 rounded-full border border-white/10 bg-white/10 px-3 text-xs font-bold text-white outline-none transition hover:bg-white/15 focus:border-indigo-300 md:max-w-[180px]"
        >
          {chapterOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#111324] text-white">
              {option.label}
            </option>
          ))}
        </select>

        {nextHref ? (
          <Link
            href={nextHref}
            prefetch={false}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-indigo-500 text-white transition hover:bg-indigo-400"
            aria-label="Chương sau"
          >
            <ChevronRight className="size-5" />
          </Link>
        ) : (
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white/35">
            <ChevronRight className="size-5" />
          </span>
        )}

        <button
          type="button"
          onClick={handleFollowClick}
          disabled={isLoading || isFollowBusy}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-red-400/40 px-4 text-xs font-bold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Heart className={`size-4 ${isFollowing ? "fill-current" : ""}`} />
          <span>{isFollowing ? "Đang theo dõi" : "Theo dõi"}</span>
        </button>
      </nav>
    </div>
  );
}
