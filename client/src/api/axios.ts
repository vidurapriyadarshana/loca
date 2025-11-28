import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add access token if available (if you decide to store it in memory)
api.interceptors.request.use(
    (config) => {
        // If you have an access token in your store, attach it here
        const state = useAuthStore.getState();
        const token = state.token;
        
        console.log('=== REQUEST INTERCEPTOR ===');
        console.log('URL:', config.url);
        console.log('Token from store:', token ? `${token.substring(0, 20)}...` : 'NULL');
        console.log('Full auth state:', { 
            hasToken: !!token, 
            isAuthenticated: state.isAuthenticated,
            hasUser: !!state.user 
        });
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Authorization header set:', config.headers.Authorization?.substring(0, 30) + '...');
        } else {
            console.log('NO TOKEN - Authorization header NOT set');
        }
        console.log('===========================');
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling 401s and refreshing tokens
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't attempt to refresh if the error is from the login endpoint itself
        if (originalRequest.url?.includes('/auth/login')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh token
                await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/refresh-token`, {}, { withCredentials: true });

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, logout
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
