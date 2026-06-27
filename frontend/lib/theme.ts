"use client";
import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "ff_theme";
const DEFAULT: Theme = "dark";

function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(DEFAULT);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme) || DEFAULT;
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return { theme, toggle };
}
