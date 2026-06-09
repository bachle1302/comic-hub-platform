"use client";

import React, { useEffect, useRef, useState } from "react";

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export function LazyLoad({
  children,
  fallback = (
    <div className="w-full space-y-4">
      <div className="h-6 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  ),
  threshold = 0.01,
  rootMargin = "200px",
}: LazyLoadProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldRender) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
        }
      },
      { threshold, rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [shouldRender, threshold, rootMargin]);

  return (
    <div ref={containerRef} className="w-full">
      {shouldRender ? children : fallback}
    </div>
  );
}
