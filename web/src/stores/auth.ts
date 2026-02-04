/**
 * Auth Store
 *
 * 認証状態を管理するZustandストア
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, UserInfo } from '@/lib/api';

// デモモード: 認証をスキップ（開発・デモ用）
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// デモユーザー
const DEMO_USER: UserInfo = {
  id: 'demo-user-001',
  username: 'demo',
  email: 'demo@ghost.local',
  roles: ['admin', 'super_admin'],
};

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isDemoMode: boolean;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  enableDemoMode: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: DEMO_MODE ? DEMO_USER : null,
      isAuthenticated: DEMO_MODE,
      isLoading: false,
      error: null,
      isDemoMode: DEMO_MODE,

      login: async (username: string, password: string) => {
        // デモモードの場合は即座に認証成功
        if (get().isDemoMode) {
          set({
            user: DEMO_USER,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await api.login({ username, password });
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Login failed',
            isLoading: false,
          });
          throw err;
        }
      },

      logout: async () => {
        // デモモードの場合はログアウトしない
        if (get().isDemoMode) {
          return;
        }

        try {
          await api.logout();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      checkAuth: async () => {
        // デモモードの場合は常に認証済み
        if (get().isDemoMode) {
          set({ user: DEMO_USER, isAuthenticated: true, isLoading: false });
          return;
        }

        const token = api.getAccessToken();
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await api.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          api.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),

      enableDemoMode: () => set({
        user: DEMO_USER,
        isAuthenticated: true,
        isDemoMode: true,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'ghost-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isDemoMode: state.isDemoMode,
      }),
    }
  )
);
