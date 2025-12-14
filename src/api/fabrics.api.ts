import { apiClient } from './client';
import { Fabric, FabricFilter, FabricReservation } from '../models/Fabric';

export const fabricsApi = {
  // Fabrics
  getFabrics: async (filters?: FabricFilter): Promise<Fabric[]> => {
    const { data } = await apiClient.get('/fabrics', { params: filters });
    return data;
  },

  getFabric: async (fabricId: string): Promise<Fabric> => {
    const { data } = await apiClient.get(`/fabrics/${fabricId}`);
    return data;
  },

  searchFabrics: async (query: string, filters?: FabricFilter): Promise<Fabric[]> => {
    const { data } = await apiClient.get('/fabrics/search', {
      params: { q: query, ...filters },
    });
    return data;
  },

  getMakerFabrics: async (makerId: string): Promise<Fabric[]> => {
    const { data } = await apiClient.get(`/fabrics/maker/${makerId}`);
    return data;
  },

  createFabric: async (payload: Omit<Fabric, 'id' | 'createdAt' | 'updatedAt'>): Promise<Fabric> => {
    const { data } = await apiClient.post('/fabrics', payload);
    return data;
  },

  updateFabric: async (fabricId: string, updates: Partial<Fabric>): Promise<Fabric> => {
    const { data } = await apiClient.patch(`/fabrics/${fabricId}`, updates);
    return data;
  },

  deleteFabric: async (fabricId: string): Promise<void> => {
    await apiClient.delete(`/fabrics/${fabricId}`);
  },

  // Reservations
  reserveFabric: async (fabricId: string, quantity: number, expiresIn: number): Promise<FabricReservation> => {
    const { data } = await apiClient.post(`/fabrics/${fabricId}/reserve`, {
      quantity,
      expiresIn,
    });
    return data;
  },

  cancelReservation: async (reservationId: string): Promise<void> => {
    await apiClient.delete(`/fabrics/reservations/${reservationId}`);
  },

  getReservations: async (userId: string): Promise<FabricReservation[]> => {
    const { data } = await apiClient.get('/fabrics/reservations', { params: { userId } });
    return data;
  },
};
