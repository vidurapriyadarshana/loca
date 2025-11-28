import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type User } from '../types';
import api from '../api/axios';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (credentials) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/login', credentials);
                    set({ user: response.data.user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            register: async (data) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/register', data);
                    set({ user: response.data.user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Logout failed', error);
                } finally {
                    set({ user: null, isAuthenticated: false });
                }
            },

            checkAuth: async () => {
                // Optional: Implement a generic check auth endpoint if available
            },

            forgotPassword: async (email: string) => {
                set({ isLoading: true });
                try {
                    await api.post('/auth/forgot-password', { email });
                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            resetPassword: async (token: string, password: string) => {
                set({ isLoading: true });
                try {
                    await api.post(`/auth/reset-password/${token}`, { password });
                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
