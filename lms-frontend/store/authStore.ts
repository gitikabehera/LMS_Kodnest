import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User { id: number; name: string; email: string; }

interface AuthState {
  user: User | null;
  setUser: (u: User | null) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      isAuthenticated: () => !!get().user,
    }),
    { name: 'lms-auth' }
  )
);
