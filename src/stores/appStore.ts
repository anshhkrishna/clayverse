import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/types";

interface AppState {
  user: UserProfile | null;
  theme: "light" | "dark" | "system";
  onboardingComplete: boolean;
  recentProjectIds: string[];

  setUser: (user: UserProfile | null) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  completeOnboarding: () => void;
  addRecentProject: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      theme: "light",
      onboardingComplete: false,
      recentProjectIds: [],

      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      addRecentProject: (id) =>
        set((s) => ({
          recentProjectIds: [id, ...s.recentProjectIds.filter((r) => r !== id)].slice(0, 10),
        })),
    }),
    { name: "clayverse-app" }
  )
);
