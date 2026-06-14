"use client";

/* eslint-disable @next/next/no-img-element */
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { getSearchSuggestions } from "@/features/search/api/search.api";
import type { SearchSuggestion } from "@/features/search/api/search.schema";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

type SearchAutocompleteProps = {
  className?: string;
  placeholder?: string;
  onNavigate?: () => void;
};

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const SUGGESTION_LIMIT = 8;

function getSuggestionTitle(suggestion: SearchSuggestion): string {
  return suggestion.title || suggestion.name || "Truyện không tên";
}

function getChapterLabel(chapterNumber?: number | null): string | null {
  return typeof chapterNumber === "number"
    ? `Chương ${chapterNumber}`
    : null;
}

export function SearchAutocomplete({
  className,
  placeholder = "Tìm truyện...",
  onNavigate,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);

  useEffect(() => {
    const normalizedQuery = debouncedQuery.trim();

    if (normalizedQuery.length < MIN_QUERY_LENGTH) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    getSearchSuggestions(normalizedQuery, SUGGESTION_LIMIT)
      .then((data) => {
        if (requestIdRef.current !== requestId) return;
        setSuggestions(data);
        setIsOpen(true);
        setActiveIndex(data.length > 0 ? 0 : -1);
      })
      .catch((error) => {
        if (requestIdRef.current !== requestId) return;
        setSuggestions([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Không thể tải gợi ý tìm kiếm.",
        );
        setIsOpen(true);
        setActiveIndex(-1);
      })
      .finally(() => {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      });
  }, [debouncedQuery]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (
        rootRef.current &&
        target instanceof Node &&
        !rootRef.current.contains(target)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function navigateTo(path: string) {
    setIsOpen(false);
    setActiveIndex(-1);
    onNavigate?.();
    router.push(path);
  }

  function navigateToSuggestion(suggestion: SearchSuggestion) {
    navigateTo(`/truyen/${suggestion.slug}`);
  }

  function handleQueryChange(nextQuery: string) {
    requestIdRef.current += 1;
    setQuery(nextQuery);

    if (nextQuery.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsLoading(false);
      setErrorMessage(null);
      setActiveIndex(-1);
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setIsLoading(true);
    setErrorMessage(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim();
    const activeSuggestion =
      activeIndex >= 0 ? suggestions[activeIndex] : undefined;

    if (activeSuggestion) {
      navigateToSuggestion(activeSuggestion);
      return;
    }

    navigateTo(
      normalizedQuery
        ? `/tim-kiem?q=${encodeURIComponent(normalizedQuery)}`
        : "/tim-kiem",
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!isOpen || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((currentIndex) =>
        currentIndex >= suggestions.length - 1 ? 0 : currentIndex + 1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((currentIndex) =>
        currentIndex <= 0 ? suggestions.length - 1 : currentIndex - 1,
      );
    }
  }

  function handleSuggestionMouseDown(
    event: MouseEvent<HTMLButtonElement>,
    suggestion: SearchSuggestion,
  ) {
    event.preventDefault();
    navigateToSuggestion(suggestion);
  }

  const normalizedQuery = query.trim();
  const shouldShowDropdown =
    isOpen && normalizedQuery.length >= MIN_QUERY_LENGTH;

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => {
            if (query.trim().length >= MIN_QUERY_LENGTH) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-10 w-full rounded-full border border-border bg-muted/40 pl-11 pr-12 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
          aria-label="Tìm truyện"
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
          aria-label="Tìm kiếm"
        >
          <Search className="size-4" />
        </button>
      </form>

      {shouldShowDropdown ? (
        <div
          id="search-autocomplete-results"
          className="absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          role="listbox"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Đang tìm kiếm...
            </div>
          ) : errorMessage ? (
            <div className="px-4 py-3 text-sm text-red-500">
              {errorMessage}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Không tìm thấy kết quả nào!
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto p-2">
              {suggestions.map((suggestion, index) => {
                const title = getSuggestionTitle(suggestion);
                const chapterLabel = getChapterLabel(
                  suggestion.latestChapterNumber,
                );
                const isActive = index === activeIndex;

                return (
                  <button
                    key={suggestion.id}
                    type="button"
                    onMouseDown={(event) =>
                      handleSuggestionMouseDown(event, suggestion)
                    }
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full gap-3 rounded-xl p-2 text-left transition ${
                      isActive ? "bg-muted" : "hover:bg-muted"
                    }`}
                    role="option"
                    aria-selected={isActive}
                  >
                    {suggestion.thumbnail ? (
                      <img
                        src={suggestion.thumbnail}
                        alt={title}
                        className="h-16 w-11 shrink-0 rounded-md object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-16 w-11 shrink-0 place-items-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                        {title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm font-semibold text-foreground">
                        {title}
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {suggestion.authorName ?? "Đang cập nhật tác giả"}
                      </span>
                      {chapterLabel ? (
                        <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          {chapterLabel}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
