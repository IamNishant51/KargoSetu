/**
 * Reload-safe localStorage helpers for the whole desk.
 *
 * Every read is SSR-safe, JSON-guarded, and shape-tolerant: a corrupt or
 * outdated blob can never crash a page — callers always get a usable value.
 * Writes never throw (private mode / full storage degrade silently).
 */

export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    if (
      fallback !== null &&
      typeof fallback === "object" &&
      !Array.isArray(fallback) &&
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return { ...(fallback as Record<string, unknown>), ...(parsed as Record<string, unknown>) } as T;
    }
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage blocked or full — the page still works, persistence just skips
  }
}
