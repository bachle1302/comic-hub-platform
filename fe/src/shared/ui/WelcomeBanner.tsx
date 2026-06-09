"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

export function WelcomeBanner() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("comichub-welcome-dismissed");
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("comichub-welcome-dismissed", "true");
    setIsVisible(false);
  };

  if (pathname !== "/" || !isVisible) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-red-700 via-orange-600 to-amber-500 shadow-md">
      {/* Decorative Sharingan-like background glow */}
      <div className="absolute -left-10 -top-10 size-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute -right-10 -bottom-10 size-32 rounded-full bg-black/20 blur-xl pointer-events-none" />

      <div className="mx-auto max-w-7xl flex min-h-[40px] items-center justify-between px-4 py-1.5 text-white">
        {/* Spacer on desktop to align the text center */}
        <div className="w-6 shrink-0 md:block hidden" />

        {/* Welcome Message */}
        <p className="flex-1 text-center text-xs sm:text-sm font-extrabold tracking-wider text-white drop-shadow-sm select-none">
          Chào mừng đến với <span className="font-black">ComicHub</span>!
        </p>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full p-1 text-white/80 transition-all hover:bg-white/20 hover:text-white hover:scale-110 active:scale-95"
          aria-label="Đóng banner chào mừng"
        >
          <X className="size-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
