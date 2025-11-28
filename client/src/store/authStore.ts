import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type User } from '../types';
import api from '../api/axios';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
    googleLogin: (token: string) => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (credentials) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/login', credentials);
                    console.log('=== LOGIN DEBUG ===');
                    console.log('Full response:', response);
                    console.log('Response data:', response.data);
                    console.log('Response data.data:', response.data.data);
                    console.log('Response data keys:', Object.keys(response.data));
                    
                    // Backend returns: {statusCode: 200, data: {user, token}, message, success}
                    const responseData = response.data.data || response.data;
                    const user = responseData.user;
                    const token = responseData.token || responseData.accessToken;
                    
                    console.log('Extracted user:', user);
                    console.log('Extracted token:', token);
                    
                    if (!token) {
                        console.error('No token found in response!');
                        throw new Error('Authentication failed: No token received');
                    }
                    
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    
                    // Verify state was set
                    const state = get();
                    console.log('State after login - Token:', state.token?.substring(0, 20) + '...');
                    console.log('State after login - User:', state.user?.name);
                    console.log('===================');
                } catch (error) {
                    console.error('Login error:', error);
                    set({ isLoading: false });
                    throw error;
                }
            },

            register: async (data) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/register', data);
                    console.log('Register response:', response.data);
                    
                    // Backend returns: {statusCode: 200, data: {user, token}, message, success}
                    const responseData = response.data.data || response.data;
                    const user = responseData.user;
                    const token = responseData.token || responseData.accessToken;
                    
                    if (!token) {
                        console.error('No token found in response!');
                        throw new Error('Registration failed: No token received');
                    }
                    
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false
                    });
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
                    set({ user: null, token: null, isAuthenticated: false });
                }
            },

            checkAuth: async () => {
                set({ isLoading: true });
                try {
                    const token = get().token;
                    console.log('checkAuth - Token available:', token ? 'Yes' : 'No');
                    
                    const response = await api.get('/users/profile');
                    console.log('checkAuth - Profile response:', response.data);
                    
                    // API returns user data directly (not wrapped)
                    const user = response.data;
                    
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    console.error('checkAuth - Failed:', error);
                    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
                }
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
            },

            googleLogin: async (token: string) => {
                set({ isLoading: true, token }); // Set token temporarily to allow the request
                try {
                    // Fetch user profile with the token
                    const response = await api.get('/users/profile');
                    console.log('googleLogin - Profile response:', response.data);
                    
                    // API returns user data directly
                    const user = response.data;
                    
                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } catch (error) {
                    set({ token: null, isLoading: false });
                    throw error;
                }
            },

            updateProfile: async (data) => {
                set({ isLoading: true });
                try {
                    const response = await api.put('/users/profile', data);
                    console.log('updateProfile - Response:', response.data);
                    
                    // Backend returns: {statusCode: 200, data: user, message, success}
                    const responseData = response.data.data || response.data;
                    const user = responseData;
                    
                    console.log('Extracted user:', user);
                    
                    set({ user, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
