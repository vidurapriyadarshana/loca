import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api';
import type { User, LoginRequest, RegisterRequest } from '../types';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setAuth: (token: string, user: User) => void;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (token, user) => {
        localStorage.setItem('accessToken', token);
        set({ accessToken: token, user, isAuthenticated: true, error: null });
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Fetch user details after login
          const userResponse = await authApi.getCurrentUser();
          set({
            accessToken,
            user: userResponse.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register(data);
          set({ isLoading: false, error: null });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('accessToken');
          set({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),

      fetchCurrentUser: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await authApi.getCurrentUser();
          set({
            user: response.data,
            accessToken: token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          localStorage.removeItem('accessToken');
          set({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
