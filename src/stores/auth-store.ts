import type { SessionData } from "react-router-dom";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  session: SessionData | null;
  setSession: (session: SessionData) => void;
  clearSession: () => void;
  accessToken: () => string | undefined;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
      accessToken: () => get().session?.access,
    }),
    {
      name: "la-noire-auth",
    },
  ),
);
