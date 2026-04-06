"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "longhorn-housing-compare";
const SYNC_EVENT = "longhorn-compare-sync";
const MAX_COMPARE = 4;

/** Same reference every call — required for useSyncExternalStore getServerSnapshot. */
const SERVER_SNAPSHOT: string[] = [];

/** Keeps referential stability for useSyncExternalStore snapshots. */
let snapshotCache: { json: string; list: string[] } = { json: "", list: [] };

function readListFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY) ?? "[]";
  if (raw === snapshotCache.json) return snapshotCache.list;
  try {
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
    snapshotCache = { json: raw, list };
    return list;
  } catch {
    snapshotCache = { json: raw, list: [] };
    return [];
  }
}

function getSnapshot(): string[] {
  return readListFromStorage();
}

function getServerSnapshot(): string[] {
  return SERVER_SNAPSHOT;
}

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener(SYNC_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(SYNC_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function writeToStorage(ids: string[]) {
  try {
    const json = JSON.stringify(ids);
    localStorage.setItem(STORAGE_KEY, json);
    snapshotCache = { json, list: [...ids] };
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: ids }));
    });
  } catch {
    // localStorage full or unavailable
  }
}

export function useCompareList() {
  const compareList = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((id: string) => {
    const prev = getSnapshot();
    let next: string[];
    if (prev.includes(id)) {
      next = prev.filter((i) => i !== id);
    } else if (prev.length >= MAX_COMPARE) {
      return;
    } else {
      next = [...prev, id];
    }
    writeToStorage(next);
  }, []);

  const clear = useCallback(() => {
    writeToStorage([]);
  }, []);

  return { compareList, toggle, clear };
}
