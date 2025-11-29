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

        console.log('=== RESPONSE INTERCEPTOR ERROR ===');
        console.log('Error status:', error.response?.status);
        console.log('URL:', originalRequest.url);
        console.log('Retry flag:', originalRequest._retry);

        // Don't attempt to refresh if the error is from auth endpoints
        if (originalRequest.url?.includes('/auth/login') || 
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh-token')) {
            console.log('Auth endpoint error - not retrying');
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log('Attempting to refresh token...');

            try {
                // Attempt to refresh token - backend returns new access token
                const refreshResponse = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/refresh-token`, 
                    {}, 
                    { withCredentials: true }
                );

                console.log('Refresh response:', refreshResponse.data);

                // Extract new token from response
                const responseData = refreshResponse.data.data || refreshResponse.data;
                const newToken = responseData.token || responseData.accessToken;

                if (newToken) {
                    console.log('New token received:', newToken.substring(0, 20) + '...');
                    
                    // Update token in store using the proper method
                    useAuthStore.getState().setToken(newToken);
                    
                    // Update the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    
                    console.log('Token updated, retrying original request...');
                    
                    // Retry original request with new token
                    return api(originalRequest);
                } else {
                    console.error('No token in refresh response');
                    throw new Error('No token received from refresh');
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // If refresh fails, logout
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        
        console.log('===================================');
        return Promise.reject(error);
    }
);

export default api;
