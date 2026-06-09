"use client";

import { useEffect, useState, useRef, FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { getSearchSuggestions } from "../api/search.api";
import type { SearchSuggestion } from "../api/search.schema";

interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  inputClassName?: string;
  onSelectSuggestion?: () => void;
}

export function SearchAutocomplete({
  className = "",
  placeholder = "Tìm truyện...",
  defaultValue = "",
  inputClassName = "",
  onSelectSuggestion,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const debouncedQuery = useDebouncedValue(query, 300);

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeRequestQueryRef = useRef<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(defaultValue);
    }, 0);
    return () => clearTimeout(timer);
  }, [defaultValue]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      const timer = setTimeout(() => {
        setSuggestions([]);
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let active = true;
    activeRequestQueryRef.current = trimmed;
    
    const timer = setTimeout(() => {
      setIsLoading(true);
    }, 0);

    getSearchSuggestions(trimmed)
      .then((data) => {
        if (active && activeRequestQueryRef.current === trimmed) {
          setSuggestions(data);
          setActiveIndex(-1);
        }
      })
      .catch((error) => {
        console.error("Failed to load search suggestions:", error);
        if (active && activeRequestQueryRef.current === trimmed) {
          setSuggestions([]);
        }
      })
      .finally(() => {
        if (active && activeRequestQueryRef.current === trimmed) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [debouncedQuery]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (activeIndex >= 0 && activeIndex < suggestions.length) {
      const activeItem = suggestions[activeIndex];
      router.push(`/truyen/${activeItem.slug}`);
      setIsOpen(false);
      onSelectSuggestion?.();
    } else {
      router.push(
        trimmedQuery
          ? `/tim-kiem?q=${encodeURIComponent(trimmedQuery)}`
          : "/tim-kiem",
      );
      setIsOpen(false);
      onSelectSuggestion?.();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) {
      if (event.key === "ArrowDown" && query.trim().length >= 2) {
        setIsOpen(true);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) =>
          prev + 1 >= suggestions.length ? 0 : prev + 1,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) =>
          prev - 1 < 0 ? suggestions.length - 1 : prev - 1,
        );
        break;
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
      default:
        break;
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleFormSubmit} className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Tìm kiếm truyện"
          className={`h-9 w-full rounded-full border border-border bg-muted/40 pl-9 pr-8 text-xs outline-none transition focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary ${inputClassName}`}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 size-3 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </form>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 mt-1 w-full max-h-80 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-xl z-50">
          {isLoading && suggestions.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
              <Loader2 className="mr-2 size-3 animate-spin" />
              Đang tìm kiếm...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              Không tìm thấy truyện phù hợp
            </div>
          ) : (
            <ul role="listbox" className="space-y-0.5">
              {suggestions.map((item, index) => {
                const displayTitle = item.title ?? item.name ?? "";
                const isActive = index === activeIndex;

                return (
                  <li
                    key={item.id}
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      router.push(`/truyen/${item.slug}`);
                      setIsOpen(false);
                      onSelectSuggestion?.();
                    }}
                    className={`flex items-center gap-3 cursor-pointer rounded-xl px-2.5 py-2 transition-colors ${
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={displayTitle}
                        width={32}
                        height={32}
                        unoptimized
                        className="size-8 rounded-lg object-cover bg-muted flex-shrink-0"
                      />
                    ) : (
                      <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground flex-shrink-0">
                        N/A
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {displayTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                        {item.authorName && (
                          <span className="truncate max-w-[100px] text-muted-foreground">
                            {item.authorName}
                          </span>
                        )}
                        {item.latestChapterNumber !== undefined &&
                          item.latestChapterNumber !== null && (
                            <span className="bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full text-[9px]">
                              Chap {item.latestChapterNumber}
                            </span>
                          )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
