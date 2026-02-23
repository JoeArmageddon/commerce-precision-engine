import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (value: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggle: () => {
        const newValue = !get().isDark;
        set({ isDark: newValue });
        document.documentElement.classList.toggle('dark', newValue);
      },
      setDark: (value: boolean) => {
        set({ isDark: value });
        document.documentElement.classList.toggle('dark', value);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.isDark);
        }
      },
    }
  )
);
