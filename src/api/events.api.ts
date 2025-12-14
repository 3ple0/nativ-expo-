import { apiClient } from './client';
import { Event, EventGuest, EventOrder } from '../models/Event';

export const eventsApi = {
  // Events
  getEvents: async (userId: string): Promise<Event[]> => {
    const { data } = await apiClient.get('/events', { params: { userId } });
    return data;
  },

  getEvent: async (eventId: string): Promise<Event> => {
    const { data } = await apiClient.get(`/events/${eventId}`);
    return data;
  },

  createEvent: async (payload: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
    const { data } = await apiClient.post('/events', payload);
    return data;
  },

  updateEvent: async (eventId: string, updates: Partial<Event>): Promise<Event> => {
    const { data } = await apiClient.patch(`/events/${eventId}`, updates);
    return data;
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    await apiClient.delete(`/events/${eventId}`);
  },

  // Event Guests
  getEventGuests: async (eventId: string): Promise<EventGuest[]> => {
    const { data } = await apiClient.get(`/events/${eventId}/guests`);
    return data;
  },

  addGuest: async (eventId: string, payload: Omit<EventGuest, 'id' | 'addedAt'>): Promise<EventGuest> => {
    const { data } = await apiClient.post(`/events/${eventId}/guests`, payload);
    return data;
  },

  removeGuest: async (eventId: string, guestId: string): Promise<void> => {
    await apiClient.delete(`/events/${eventId}/guests/${guestId}`);
  },

  updateGuestStatus: async (eventId: string, guestId: string, status: EventGuest['status']): Promise<EventGuest> => {
    const { data } = await apiClient.patch(`/events/${eventId}/guests/${guestId}`, { status });
    return data;
  },

  // Event Orders
  getEventOrders: async (eventId: string): Promise<EventOrder[]> => {
    const { data } = await apiClient.get(`/events/${eventId}/orders`);
    return data;
  },

  createEventOrder: async (eventId: string, payload: Omit<EventOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<EventOrder> => {
    const { data } = await apiClient.post(`/events/${eventId}/orders`, payload);
    return data;
  },

  updateEventOrder: async (eventId: string, orderId: string, updates: Partial<EventOrder>): Promise<EventOrder> => {
    const { data } = await apiClient.patch(`/events/${eventId}/orders/${orderId}`, updates);
    return data;
  },

  // Invite Link & QR
  getInviteLink: async (eventId: string): Promise<{ link: string; qrCode: string }> => {
    const { data } = await apiClient.get(`/events/${eventId}/invite-link`);
    return data;
  },

  generateInviteQR: async (eventId: string): Promise<{ qrCode: string }> => {
    const { data } = await apiClient.post(`/events/${eventId}/generate-qr`);
    return data;
  },
};
