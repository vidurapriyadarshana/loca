import axiosInstance from './axiosConfig';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types';

export const authApi = {
  register: async (data: RegisterRequest): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },

  googleLogin: (): void => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    window.location.href = `${apiUrl}/auth/google`;
  },

  refreshToken: async (): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post('/auth/refresh-token');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (token: string, data: ResetPasswordRequest): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`/auth/reset-password/${token}`, data);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  },
};
