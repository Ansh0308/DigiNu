"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface Quick86SwitchProps {
  itemId: string;
  initialAvailable: boolean;
  dishName: string;
  size?: "sm" | "md";
  onStatusChange?: (newStatus: boolean) => void;
}

export function Quick86Switch({
  itemId,
  initialAvailable,
  dishName,
  size = "md",
  onStatusChange,
}: Quick86SwitchProps) {
  const [isAvailable, setIsAvailable] = useState(initialAvailable);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previousState = isAvailable;
    const nextState = !isAvailable;

    // 1. Optimistic UI update (immediate visual feedback)
    setIsAvailable(nextState);
    setIsPending(true);
    onStatusChange?.(nextState);

    try {
      const response = await fetch(`/api/admin/items/${itemId}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: nextState }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData?.error?.message || "Failed to update availability");
      }

      toast.success(
        nextState
          ? `"${dishName}" is now Available on the customer menu.`
          : `"${dishName}" marked as Sold Out (86'd).`
      );
    } catch (err: unknown) {
      // Revert on error
      setIsAvailable(previousState);
      onStatusChange?.(previousState);
      const errMsg = err instanceof Error ? err.message : "Network error";
      toast.error(`Could not update "${dishName}": ${errMsg}`);
    } finally {
      setIsPending(false);
    }
  };

  const isSmall = size === "sm";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isAvailable}
      aria-label={`Toggle availability for ${dishName}: currently ${isAvailable ? "Available" : "Sold Out"}`}
      disabled={isPending}
      onClick={handleToggle}
      className={`group relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] ${
        isSmall ? "h-6 w-11" : "h-7 w-14"
      } ${
        isAvailable
          ? "bg-emerald-600 hover:bg-emerald-500"
          : "bg-rose-600 hover:bg-rose-500"
      } ${isPending ? "opacity-75" : ""}`}
    >
      <span className="sr-only">
        {isAvailable ? "Dish is Available" : "Dish is Sold Out"}
      </span>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          isSmall ? "h-4 w-4" : "h-5 w-5"
        } ${
          isAvailable
            ? isSmall
              ? "translate-x-6"
              : "translate-x-8"
            : isSmall
            ? "translate-x-1"
            : "translate-x-1"
        }`}
      />
    </button>
  );
}

