export interface User {
    _id?: string;
    name: string;
    email: string;
    age: number;
    gender: string;
    bio?: string;
    photos?: string[];
    interests?: string[];
    location?: {
        type: string;
        coordinates: number[];
    };
    is_verified?: boolean;
    last_active?: string;
    createdAt?: string;
    updatedAt?: string;
    preferences?: {
        notifications: boolean;
    };
}

export interface AuthResponse {
    user: User;
    accessToken?: string;
}

export interface Match {
    _id: string;
    user1: User;
    user2: User;
    created_at: string;
}


export interface Swipe {
    _id: string;
    swiped_by: string;
    swiped_on: User;
    direction: 'LEFT' | 'RIGHT';
    created_at: string;
}
