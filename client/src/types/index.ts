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
    accessToken?: string; // Assuming accessToken might be returned
}
