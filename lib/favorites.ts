"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "repp:favorites";
const EVENT = "repp:favorites:change";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useFavorites() {
  const ids = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(read()),
    () => "[]",
  );
  const list = JSON.parse(ids) as string[];
  return list;
}

export function useFavorite(id: string) {
  const list = useFavorites();
  const isFavorite = list.includes(id);

  const toggle = () => {
    const current = read();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    write(next);
  };

  return { isFavorite, toggle };
}

export function useHasMounted() {
  const ids = useSyncExternalStore(
    subscribe,
    () => "1",
    () => "0",
  );
  return ids === "1";
}

// Hook that hydrates safely (returns 0 on server, true count on client)
export function useFavoriteCount() {
  const list = useFavorites();
  const mounted = useHasMounted();
  return mounted ? list.length : 0;
}

// Convenience used in client components only
export function clearFavorites() {
  write([]);
}

// Used in Footer / global so we can re-export for any context
export const favoritesAPI = {
  read,
  write,
};
