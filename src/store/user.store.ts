/**
 * @file user.store.ts
 * @description Persistent Zustand store for managing client authentication state and user session.
 */

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { AuthUser } from "@/types/auth"

interface UserState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  hasHydrated: boolean

  // Actions
  setAuth: (user: AuthUser, accessToken: string, refreshToken?: string) => void
  setTokens: (accessToken: string, refreshToken?: string) => void
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
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken: refreshToken ?? get().refreshToken,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken: refreshToken ?? get().refreshToken,
          isAuthenticated: true,
        })
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
          refreshToken: null,
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
        refreshToken: state.refreshToken,
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

