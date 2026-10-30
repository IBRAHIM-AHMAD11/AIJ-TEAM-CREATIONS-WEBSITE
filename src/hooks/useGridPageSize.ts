// hooks/useGridPageSize.ts
"use client";

import { useEffect, useState } from "react";

// Mirror of: grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
function getColumns(width: number): number {
  if (width >= 1024) return 4; // lg
  if (width >= 768) return 3;  // md
  if (width >= 640) return 2;  // sm
  return 1;
}

function computePageSize(width: number, height: number, bufferScreens: number): number {
  const cols = getColumns(width);
  const contentWidth = Math.min(width, 1280) - 32;          // container + px-4
  const colWidth = (contentWidth - (cols - 1) * 24) / cols; // gap-6 = 24px
  const cardHeight = colWidth + 150;                        // square image + text/price (heuristic)
  const rows = Math.ceil(height / cardHeight);
  return Math.min(48, Math.max(8, cols * rows * bufferScreens)); // cap over-fetching
}

export function useGridPageSize(bufferScreens = 2): number {
  // Lazy init: real size on the client, safe default for SSR
  const [pageSize, setPageSize] = useState(() =>
    typeof window === "undefined"
      ? 12
      : computePageSize(window.innerWidth, window.innerHeight, bufferScreens)
  );

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const next = computePageSize(window.innerWidth, window.innerHeight, bufferScreens);
        setPageSize((prev) => (prev === next ? prev : next)); // no-op if unchanged
      }, 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timeout);
    };
  }, [bufferScreens]);

  return pageSize;
}