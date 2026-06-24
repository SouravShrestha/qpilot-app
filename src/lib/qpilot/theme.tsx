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
import { STORAGE } from "./storage";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeCtx {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (m: ThemeMode) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && sysDark);
  if (isDark) {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    const stored = (typeof window !== "undefined"
      ? (window.localStorage.getItem(STORAGE.theme) as ThemeMode | null)
      : null) ?? "system";
    setModeState(stored);
    applyTheme(stored);
  }, []);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    window.localStorage.setItem(STORAGE.theme, m);
    applyTheme(m);
  }, []);

  const value = useMemo<ThemeCtx>(() => {
    const sysDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved: "light" | "dark" =
      mode === "dark" || (mode === "system" && sysDark) ? "dark" : "light";
    return { mode, resolved, setMode };
  }, [mode, setMode]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme must be inside ThemeProvider");
  return c;
}