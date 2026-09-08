/**
 * @file user.store.ts
 * @description Persistent Zustand store for managing client authentication state and user profile.
 */

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { AuthUser } from "@/types/auth"

interface UserState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  hasHydrated: boolean

  // Actions
  setAuth: (user: AuthUser, accessToken?: string | null) => void
  setAccessToken: (accessToken: string | null) => void
  setUser: (user: AuthUser) => void
  setLoading: (isLoading: boolean) => void
  setHasHydrated: (hasHydrated: boolean) => void
  logout: () => void
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      setAuth: (user, accessToken) => {
        set({
          user,
          accessToken: accessToken ?? null,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      setAccessToken: (accessToken) => {
        set({ accessToken })
      },

      setUser: (user) => {
        set({ user })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated })
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },
    }),
    {
      name: "meeo-auth-session",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage
      ),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true)
        }
      },
    }
  )
)

