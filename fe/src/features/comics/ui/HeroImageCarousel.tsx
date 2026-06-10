"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Comic } from "../api/comics.schema";

type HeroImageCarouselProps = {
  comics: Comic[];
  className?: string;
};

const SLIDE_INTERVAL_MS = 5000;

function getCategoryTags(comic: Comic): string {
  return (
    comic.categories
      ?.map((item) => item.category.name)
      .filter((name): name is string => Boolean(name))
      .slice(0, 3)
      .map((name) => `#${name}`)
      .join(" ") ?? ""
  );
}

export function HeroImageCarousel({ comics, className = "" }: HeroImageCarouselProps) {
  const slides = useMemo(
    () => comics.filter((comic) => Boolean(comic.thumbnail)).slice(0, 8),
    [comics],
  );

  const extendedSlides = useMemo(() => {
    if (slides.length <= 1) return slides;
    // Prepend last 2 slides, append first 2 slides
    return [
      ...slides.slice(-2),
      ...slides,
      ...slides.slice(0, 2),
    ];
  }, [slides]);

  const [currentIndex, setCurrentIndex] = useState(slides.length > 1 ? 2 : 0);
  const [disableTransition, setDisableTransition] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [width, setWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute active original index (0 to N-1) from currentIndex
  const activeIndex = useMemo(() => {
    if (slides.length <= 1) return 0;
    const originalIndex = (currentIndex - 2) % slides.length;
    return originalIndex < 0 ? originalIndex + slides.length : originalIndex;
  }, [currentIndex, slides.length]);

  // Track responsive screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track container width for translate calculations
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Auto slide every 5 seconds, pause on hover
  useEffect(() => {
    if (slides.length <= 1 || isHovered || disableTransition) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((current) => current + 1);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [slides.length, isHovered, disableTransition]);

  // Handle instant jump when crossing boundaries to simulate infinite scroll
  const handleTransitionEnd = () => {
    if (slides.length <= 1) return;
    if (currentIndex >= slides.length + 2) {
      setDisableTransition(true);
      setCurrentIndex(2);
    } else if (currentIndex <= 1) {
      setDisableTransition(true);
      setCurrentIndex(slides.length + 1);
    }
  };

  // Re-enable transition after the instant jump has completed rendering
  useEffect(() => {
    if (disableTransition) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDisableTransition(false);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [disableTransition]);

  if (slides.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
        Chưa có truyện nổi bật để hiển thị.
      </section>
    );
  }

  function goToPrevious() {
    if (disableTransition) return;
    setCurrentIndex((current) => current - 1);
  }

  function goToNext() {
    if (disableTransition) return;
    setCurrentIndex((current) => current + 1);
  }

  const handleSlideClick = (e: React.MouseEvent, indexInExtended: number) => {
    const originalIndex = (indexInExtended - 2) % slides.length;
    const normalizedIndex = originalIndex < 0 ? originalIndex + slides.length : originalIndex;
    if (normalizedIndex !== activeIndex) {
      e.preventDefault();
      if (disableTransition) return;
      setCurrentIndex(indexInExtended);
    }
  };

  const handleDotClick = (dotIndex: number) => {
    if (disableTransition) return;
    setCurrentIndex(dotIndex + 2);
  };

  // Calculations for sliding translate offset:
  // - On Mobile: active slide is 100% width, translateX is simple offset
  // - On Desktop: active slide is 60% width, side slides are 20% visible, active slide is centered
  const slideWidth = isMobile ? width : width * 0.6;
  const gap = 16;
  const translateValue = isMobile
    ? -currentIndex * (width + gap)
    : width * 0.2 - currentIndex * (slideWidth + gap);

  return (
    <section
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full overflow-hidden ${className}`}
      aria-label="Hero Comic Carousel"
    >
      {/* Outer track wrapper */}
      <div
        className="flex h-[280px] sm:h-[360px] md:h-[460px] xl:h-[548px]"
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translateX(${translateValue}px)`,
          gap: `${gap}px`,
          transition: disableTransition ? "none" : "transform 700ms ease-out",
        }}
      >
        {extendedSlides.map((comic, index) => {
          const isActive = index === currentIndex;
          const tags = getCategoryTags(comic);

          return (
            <div
              key={`${comic.id}-${index}`}
              style={{
                width: isMobile ? "100%" : "60%",
                flexShrink: 0,
              }}
              className="relative h-full"
            >
              <Link
                href={`/truyen/${comic.slug}`}
                prefetch={false}
                onClick={(e) => handleSlideClick(e, index)}
                className="group block h-full w-full"
                aria-label={`Xem chi tiết truyện ${comic.name}`}
              >
                <article
                  className={`relative h-full w-full overflow-hidden rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-950 transition-all duration-500 ${isActive ? "opacity-100 shadow-[0_24px_50px_rgba(0,0,0,0.55)]" : "opacity-45"
                    }`}
                >
                  {comic.thumbnail ? (
                    <Image
                      src={comic.thumbnail}
                      alt={comic.name}
                      fill
                      priority={index === 2}
                      sizes={
                        isMobile
                          ? "100vw"
                          : isActive
                            ? "(min-width: 1280px) 60vw, 70vw"
                            : "(min-width: 1280px) 20vw, 25vw"
                      }
                      unoptimized
                      className={`object-cover transition-transform duration-700 ease-out ${isActive ? "group-hover:scale-[1.03]" : ""
                        }`}
                    />
                  ) : null}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                  {/* Text Details */}
                  {isActive && (
                    <div className="absolute bottom-6 left-4 right-4 z-10 max-w-4xl space-y-1 md:bottom-10 md:left-10 md:right-10">
                      <h2 className="line-clamp-2 text-lg font-bold uppercase leading-tight text-white drop-shadow-md transition-all duration-300 group-hover:text-white group-hover:translate-x-1 sm:text-xl md:text-2xl lg:text-3xl">
                        {comic.name}
                      </h2>
                      {tags && (
                        <p className="text-[10px] font-medium tracking-wide text-zinc-300 drop-shadow-sm sm:text-xs md:text-sm">
                          {tags}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-zinc-800/90 hover:text-white"
            aria-label="Slide trước"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-zinc-800/90 hover:text-white"
            aria-label="Slide tiếp theo"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 md:bottom-6">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleDotClick(index)}
              className={`h-1.5 rounded-full transition-all duration-350 ${index === activeIndex ? "w-6 bg-[#E53935]" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
