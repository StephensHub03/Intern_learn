/**
 * Auth store using React state + sessionStorage persistence.
 * sessionStorage clears on tab/browser close and page reload,
 * so the user always starts from the landing page on a fresh load.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      setAccessToken: (accessToken) => set({ accessToken }),

      logout: () => set({ user: null, accessToken: null, refreshToken: null }),

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'auth-storage',
      // sessionStorage clears on reload → always lands on landing page
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
