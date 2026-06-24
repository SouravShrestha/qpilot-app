import type { FavoriteMap, Difficulty, RecentSession } from "./types";

export const STORAGE = {
  theme: "qpilot:theme",
  appKey: "qpilot:app-api-key",
  groqKey: "qpilot:groq-api-key",
  favorites: "qpilot:favorites",
  recent: "qpilot:recent",
  difficulty: "qpilot:difficulty",
  model: "qpilot:model",
  recommendations: "qpilot:recommendations",
} as const;

// Lightweight obfuscation (NOT real encryption — keys live in the browser).
// Goal: prevent casual eyeballing in devtools storage panel.
const SALT = "qpilot.v1";
export function obfuscate(value: string): string {
  if (!value) return "";
  if (typeof btoa === "undefined") return value;
  const xored = Array.from(value)
    .map((ch, i) =>
      String.fromCharCode(ch.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length)),
    )
    .join("");
  return btoa(unescape(encodeURIComponent(xored)));
}
export function deobfuscate(value: string): string {
  if (!value) return "";
  try {
    const xored = decodeURIComponent(escape(atob(value)));
    return Array.from(xored)
      .map((ch, i) =>
        String.fromCharCode(ch.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length)),
      )
      .join("");
  } catch {
    return "";
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

export function readString(key: string): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(key) ?? "";
}

export function writeString(key: string, value: string): void {
  if (typeof window === "undefined") return;
  if (value) window.localStorage.setItem(key, value);
  else window.localStorage.removeItem(key);
}

export function loadFavorites(): FavoriteMap {
  return readJSON<FavoriteMap>(STORAGE.favorites, {});
}
export function saveFavorites(b: FavoriteMap): void {
  writeJSON(STORAGE.favorites, b);
}

export function loadRecents(): RecentSession[] {
  return readJSON<RecentSession[]>(STORAGE.recent, []);
}
export function saveRecents(r: RecentSession[]): void {
  writeJSON(STORAGE.recent, r.slice(0, 20));
}

export function loadDifficulty(): Difficulty {
  const v = readString(STORAGE.difficulty);
  if (v === "easy" || v === "medium" || v === "hard" || v === "mixed") return v;
  return "medium";
}

export function loadRecommendations(): string[] {
  return readJSON<string[]>(STORAGE.recommendations, []);
}
export function saveRecommendations(r: string[]): void {
  writeJSON(STORAGE.recommendations, r);
}