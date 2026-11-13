"use client";

import { useEffect, useRef } from "react";
import { X, Clock, Calendar } from "lucide-react";
import { formatTime12h } from "@/lib/hours-calculator";

interface OperatingHourItem {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface OperatingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  hours: OperatingHourItem[];
  restaurantName: string;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export function OperatingHoursModal({
  isOpen,
  onClose,
  hours,
  restaurantName,
}: OperatingHoursModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const currentDay = new Date().getDay();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Ensure all 7 days are represented in order (Sunday 0 to Saturday 6)
  const fullWeek = [0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
    const existing = hours.find((h) => h.dayOfWeek === dayIdx);
    return {
      dayOfWeek: dayIdx,
      dayName: DAY_NAMES[dayIdx],
      isToday: dayIdx === currentDay,
      openTime: existing?.openTime || "11:00",
      closeTime: existing?.closeTime || "22:00",
      isClosed: existing ? existing.isClosed : false,
    };
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hours-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-2xl overflow-hidden p-6 animate-scaleUp"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--surface-border)]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="hours-modal-title" className="font-editorial text-xl font-bold text-[var(--text-primary)]">
                Operating Hours
              </h2>
              <p className="text-xs text-[var(--text-muted)]">{restaurantName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close operating hours modal"
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-canvas)] rounded-full transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 divide-y divide-[var(--surface-border)]">
          {fullWeek.map((day) => (
            <div
              key={day.dayOfWeek}
              className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-sm transition-colors ${
                day.isToday
                  ? "bg-[var(--brand-primary)]/10 font-semibold text-[var(--brand-primary)]"
                  : "text-[var(--text-primary)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 opacity-50" aria-hidden="true" />
                <span>{day.dayName}</span>
                {day.isToday && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[var(--brand-primary)] text-white font-sans">
                    Today
                  </span>
                )}
              </div>
              <div className="tabular-nums">
                {day.isClosed ? (
                  <span className="text-red-500 font-medium">Closed</span>
                ) : (
                  <span>
                    {formatTime12h(day.openTime)} – {formatTime12h(day.closeTime)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--surface-border)] text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-medium text-sm text-white bg-[var(--brand-primary)] hover:opacity-95 transition-opacity"
          >
            Close Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

