"use client";

import { Moon } from "lucide-react";

interface OutsideHoursBannerProps {
  todayHoursText: string;
}

export function OutsideHoursBanner({ todayHoursText }: OutsideHoursBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center text-xs sm:text-sm text-amber-900 flex items-center justify-center gap-2"
    >
      <Moon className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
      <span>
        The restaurant is currently closed for dine-in ({todayHoursText}). Feel free to explore our menu!
      </span>
    </div>
  );
}

