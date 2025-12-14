import { apiClient } from './client';
import { User } from '../models/User';

export interface SignUpPayload {
  email: string;
  password: string;
  name: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authApi = {
  signUp: async (payload: SignUpPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/signup', payload);
    return data;
  },

  signIn: async (payload: SignInPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/signin', payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    return data;
  },

  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/profile');
    return data;
  },

  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const { data } = await apiClient.patch('/auth/profile', updates);
    return data;
  },

  setRole: async (role: string): Promise<User> => {
    const { data } = await apiClient.post('/auth/set-role', { role });
    return data;
  },
};
