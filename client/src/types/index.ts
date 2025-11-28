// Common types and interfaces

export interface User {
  _id: string;
  name: string;
  email: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  photos?: string[];
  interests?: string[];
  location?: {
    type: string;
    coordinates: [number, number];
  };
  is_verified: boolean;
  last_active: Date;
  preferences?: {
    notifications: boolean;
  };
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  photos?: string[];
  interests?: string[];
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

export interface AuthResponse {
  accessToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
}
