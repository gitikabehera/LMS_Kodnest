import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  dark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      dark: false,
      toggle: () => {
        const next = !get().dark;
        document.documentElement.classList.toggle('dark', next);
        set({ dark: next });
      },
    }),
    { name: 'lms-theme' }
  )
);

// Apply on load
if (typeof window !== 'undefined') {
  const stored = JSON.parse(localStorage.getItem('lms-theme') || '{}');
  if (stored?.state?.dark) document.documentElement.classList.add('dark');
}
