import { create } from 'zustand';

export interface ThemeState {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark') => void;
}

const THEME_KEY = 'mui-theme-mode';

function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;

  if (stored === 'light' || stored === 'dark') return stored;

  // Fallback to system preference
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const defaultMode = prefersDark ? 'dark' : 'light';
  localStorage.setItem(THEME_KEY, defaultMode);
  return defaultMode;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: getInitialTheme(),

  toggleTheme: () =>
    set((state) => {
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, newMode);
      return { mode: newMode };
    }),

  setTheme: (mode) => {
    localStorage.setItem(THEME_KEY, mode);
    set({ mode });
  },
}));
