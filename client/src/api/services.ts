import type { User } from '@/types';
import api from './axios';

// ============ USER API ============
export const userAPI = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data.data;
    },

    updateProfile: async (data: Partial<User>) => {
        const response = await api.put('/users/profile', data);
        return response.data.data;
    },

    updateLocation: async (longitude: number, latitude: number) => {
        const response = await api.put('/users/location', { longitude, latitude });
        return response.data.data;
    },

    getNearbyUsers: async (params?: {
        longitude?: number;
        latitude?: number;
        radius?: number;
        limit?: number;
        gender?: string;
    }) => {
        const response = await api.get('/users/nearby', { params });
        return response.data.data;
    },

    getUsersInArea: async (coordinates: number[][], limit?: number, gender?: string) => {
        const params: any = { coordinates: JSON.stringify(coordinates) };
        if (limit) params.limit = limit;
        if (gender) params.gender = gender;
        const response = await api.get('/users/in-area', { params });
        return response.data.data;
    },
};

// ============ SWIPE API ============
export interface SwipeData {
    swiped_on: string;
    direction: 'LEFT' | 'RIGHT';
}

export interface SwipeResponse {
    created: number;
    swipes: any[];
    matches: any[];
    matchCount: number;
    errors: any[];
}

export const swipeAPI = {
    createSwipes: async (swipes: SwipeData[]): Promise<SwipeResponse> => {
        const response = await api.post('/swipes', swipes);
        return response.data.data;
    },

    getSwipeHistory: async (direction?: 'LEFT' | 'RIGHT') => {
        const params = direction ? { direction } : {};
        const response = await api.get('/swipes/history', { params });
        return response.data.data;
    },
};

// ============ MATCH API ============
export interface Match {
    _id: string;
    user1: User;
    user2: User;
    created_at: string;
}

export const matchAPI = {
    getMatches: async (): Promise<{ matches: Match[]; count: number }> => {
        const response = await api.get('/matches');
        return response.data.data;
    },
};

// ============ IMAGE API ============
export const imageAPI = {
    uploadImage: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post('/uploads/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },
};
