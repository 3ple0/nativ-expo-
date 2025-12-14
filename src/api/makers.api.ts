import { apiClient } from './client';
import { MakerProfile } from '../models/User';

export const makersApi = {
  // Maker Profiles
  getMaker: async (makerId: string): Promise<MakerProfile> => {
    const { data } = await apiClient.get(`/makers/${makerId}`);
    return data;
  },

  getMakers: async (filters?: { specialization?: string; minRating?: number }): Promise<MakerProfile[]> => {
    const { data } = await apiClient.get('/makers', { params: filters });
    return data;
  },

  searchMakers: async (query: string): Promise<MakerProfile[]> => {
    const { data } = await apiClient.get('/makers/search', { params: { q: query } });
    return data;
  },

  updateMakerProfile: async (makerId: string, updates: Partial<MakerProfile>): Promise<MakerProfile> => {
    const { data } = await apiClient.patch(`/makers/${makerId}`, updates);
    return data;
  },

  // Messaging
  sendMessage: async (makerId: string, message: string): Promise<{ id: string; createdAt: string }> => {
    const { data } = await apiClient.post(`/makers/${makerId}/messages`, { message });
    return data;
  },

  getMessages: async (makerId: string): Promise<any[]> => {
    const { data } = await apiClient.get(`/makers/${makerId}/messages`);
    return data;
  },

  // Design Booking
  bookDesign: async (makerId: string, payload: { title: string; description: string; budget: number }): Promise<{ id: string }> => {
    const { data } = await apiClient.post(`/makers/${makerId}/designs/book`, payload);
    return data;
  },

  getDesignBookings: async (makerId: string): Promise<any[]> => {
    const { data } = await apiClient.get(`/makers/${makerId}/designs/bookings`);
    return data;
  },

  // Ratings & Reviews
  rateMaker: async (makerId: string, rating: number, review?: string): Promise<void> => {
    await apiClient.post(`/makers/${makerId}/rate`, { rating, review });
  },

  getMakerReviews: async (makerId: string): Promise<any[]> => {
    const { data } = await apiClient.get(`/makers/${makerId}/reviews`);
    return data;
  },
};
