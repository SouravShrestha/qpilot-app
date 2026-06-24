"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  STORAGE,
  deobfuscate,
  loadFavorites,
  loadDifficulty,
  loadRecents,
  loadRecommendations,
  obfuscate,
  readString,
  saveFavorites,
  saveRecents,
  saveRecommendations,
  writeString,
} from "./storage";
import type { FavoriteMap, Difficulty, Question, RecentSession } from "./types";

interface AppState {
  appKey: string;
  groqKey: string;
  setAppKey: (v: string) => void;
  setGroqKey: (v: string) => void;
  model: string;
  setModel: (v: string) => void;

  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;

  favorites: FavoriteMap;
  toggleFavorite: (topic: string, q: Question) => void;
  isFavorite: (topic: string, id: number) => boolean;
  renameFavorite: (oldTopic: string, newTopic: string) => void;
  removeFavoriteFolder: (topic: string) => void;

  recents: RecentSession[];
  addRecent: (r: RecentSession) => void;
  removeRecent: (timestamp: number) => void;
  renameRecent: (timestamp: number, name: string) => void;
  togglePinRecent: (timestamp: number) => void;

  recommendations: string[];
  addRecommendations: (topics: string[]) => void;
}

const Ctx = createContext<AppState | null>(null);

const ENV_DEFAULT_APP_KEY = process.env.NEXT_PUBLIC_APP_API_KEY || "";

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [appKey, setAppKeyState] = useState("");
  const [groqKey, setGroqKeyState] = useState("");
  const [model, setModelState] = useState("");
  const [difficulty, setDifficultyState] = useState<Difficulty>("medium");
  const [favorites, setFavorites] = useState<FavoriteMap>({});
  const [recents, setRecents] = useState<RecentSession[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    setAppKeyState(ENV_DEFAULT_APP_KEY);
    setGroqKeyState(deobfuscate(readString(STORAGE.groqKey)));
    setModelState(readString(STORAGE.model));
    setDifficultyState(loadDifficulty());
    setFavorites(loadFavorites());
    setRecents(loadRecents());
    setRecommendations(loadRecommendations());
    setHydrated(true);
  }, []);

  const setAppKey = useCallback((v: string) => {
    setAppKeyState(v);
  }, []);
  const setGroqKey = useCallback((v: string) => {
    setGroqKeyState(v);
    writeString(STORAGE.groqKey, v ? obfuscate(v) : "");
  }, []);
  const setModel = useCallback((v: string) => {
    setModelState(v);
    writeString(STORAGE.model, v);
  }, []);
  const setDifficulty = useCallback((d: Difficulty) => {
    setDifficultyState(d);
    writeString(STORAGE.difficulty, d);
  }, []);

  const toggleFavorite = useCallback((topic: string, q: Question) => {
    setFavorites((prev) => {
      const list = prev[topic] ?? [];
      const exists = list.some((x) => x.id === q.id);
      const next: FavoriteMap = { ...prev };
      if (exists) {
        const filtered = list.filter((x) => x.id !== q.id);
        if (filtered.length === 0) delete next[topic];
        else next[topic] = filtered;
      } else {
        next[topic] = [...list, q];
      }
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (topic: string, id: number) =>
      Boolean(favorites[topic]?.some((x) => x.id === id)),
    [favorites],
  );

  const renameFavorite = useCallback((oldTopic: string, newTopic: string) => {
    setFavorites((prev) => {
      if (!prev[oldTopic] || oldTopic === newTopic) return prev;
      const next = { ...prev };
      next[newTopic] = next[oldTopic];
      delete next[oldTopic];
      saveFavorites(next);
      return next;
    });
  }, []);

  const removeFavoriteFolder = useCallback((topic: string) => {
    setFavorites((prev) => {
      const next = { ...prev };
      delete next[topic];
      saveFavorites(next);
      return next;
    });
  }, []);

  const addRecommendations = useCallback((topics: string[]) => {
    if (!topics.length) return;
    setRecommendations((prev) => {
      const seen = new Set(topics.map((t) => t.toLowerCase()));
      const deduped = [...topics, ...prev.filter((t) => !seen.has(t.toLowerCase()))].slice(0, 20);
      saveRecommendations(deduped);
      return deduped;
    });
  }, []);

  const addRecent = useCallback((r: RecentSession) => {
    setRecents((prev) => {
      const filtered = prev.filter(
        (x) =>
          x.topic.toLowerCase() !== r.topic.toLowerCase() ||
          x.difficulty !== r.difficulty,
      );
      const next = [r, ...filtered].slice(0, 20);
      saveRecents(next);
      return next;
    });
  }, []);

  const removeRecent = useCallback((timestamp: number) => {
    setRecents((prev) => {
      const next = prev.filter((r) => r.timestamp !== timestamp);
      saveRecents(next);
      return next;
    });
  }, []);

  const renameRecent = useCallback((timestamp: number, name: string) => {
    setRecents((prev) => {
      const next = prev.map((r) =>
        r.timestamp === timestamp ? { ...r, customName: name } : r
      );
      saveRecents(next);
      return next;
    });
  }, []);

  const togglePinRecent = useCallback((timestamp: number) => {
    setRecents((prev) => {
      const next = prev.map((r) =>
        r.timestamp === timestamp ? { ...r, pinned: !r.pinned } : r
      );
      saveRecents(next);
      return next;
    });
  }, []);

  const sortedRecents = useMemo(() => {
    return [...recents].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.timestamp - a.timestamp; // recent first
    });
  }, [recents]);

  const value = useMemo<AppState>(
    () => ({
      appKey,
      groqKey,
      setAppKey,
      setGroqKey,
      model,
      setModel,
      difficulty,
      setDifficulty,
      favorites,
      toggleFavorite,
      isFavorite,
      renameFavorite,
      removeFavoriteFolder,
      recents: sortedRecents,
      addRecent,
      removeRecent,
      renameRecent,
      togglePinRecent,
      recommendations,
      addRecommendations,
    }),
    [
      appKey,
      groqKey,
      setAppKey,
      setGroqKey,
      model,
      setModel,
      difficulty,
      setDifficulty,
      favorites,
      toggleFavorite,
      isFavorite,
      renameFavorite,
      removeFavoriteFolder,
      sortedRecents,
      addRecent,
      removeRecent,
      renameRecent,
      togglePinRecent,
      recommendations,
      addRecommendations,
    ],
  );

  // Avoid hydration-flicker for key-dependent UI: render children once hydrated.
  if (!hydrated) {
    return (
      <div className="min-h-dvh bg-background" aria-hidden="true" />
    );
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAppState must be inside AppStateProvider");
  return c;
}