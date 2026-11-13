"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export function useScrollSpy(categoryIds: string[], offsetPx: number = 80) {
  const [activeId, setActiveId] = useState<string>(categoryIds[0] || "");
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToCategory = useCallback(
    (id: string) => {
      setActiveId(id);
      isProgrammaticScroll.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      const targetElement = document.getElementById(`category-${id}`);
      if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = Math.max(0, elementPosition - offsetPx);

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        scrollTimeoutRef.current = setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 800);
      } else {
        isProgrammaticScroll.current = false;
      }
    },
    [offsetPx]
  );

  useEffect(() => {
    if (categoryIds.length === 0) return;

    const handleScroll = () => {
      if (isProgrammaticScroll.current) return;

      const scrollPosition = window.scrollY + offsetPx + 60;
      let currentActive = categoryIds[0];

      for (const id of categoryIds) {
        const el = document.getElementById(`category-${id}`);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            currentActive = id;
          }
        }
      }

      setActiveId(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [categoryIds, offsetPx]);

  return { activeId, scrollToCategory };
}

