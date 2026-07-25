"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "aij_recently_viewed";
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setIds(JSON.parse(stored));
    } catch {}
  }, []);

  const add = useCallback((productId: string) => {
    setIds((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { recentlyViewedIds: ids, addRecentlyViewed: add };
}
