import { create } from 'zustand';
import { Event, EventGuest, EventOrder, DistributionMode } from '../models/Event';
import { Fabric } from '../models/Fabric';
import { eventSupabaseService } from '@/src/api/supabase/events';

/**
 * Active event context state
 * Contains all data needed for event dashboard flow
 */
interface ActiveEventContext {
  eventId: string;
  distributionMode: DistributionMode;
  hostDeposit?: number;
  hostDepositPercentage?: number;
  selectedFabric?: Fabric;
  pricingBreakdown?: {
    fabricCost: number;
    tailor?: number;
    shipping?: number;
    platform_fee?: number;
    tax?: number;
    total: number;
    currency: string;
  };
}

interface EventState {
  // All user events
  events: Event[];
  
  // Active event for current flow
  activeEventContext: ActiveEventContext | null;
  currentEvent: Event | null;
  
  // Event guests
  eventGuests: EventGuest[];
  
  // Event orders
  eventOrders: EventOrder[];
  
  // Loading & error
  isLoading: boolean;
  error: string | null;

  // Actions - Event Management
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
  
  // Actions - Active Event Context
  setActiveEventContext: (context: ActiveEventContext | null) => void;
  setCurrentEvent: (event: Event | null) => void;
  updateDistributionMode: (mode: DistributionMode) => void;
  setHostDeposit: (amount: number, percentage?: number) => void;
  setSelectedFabric: (fabric: Fabric | undefined) => void;
  setPricingBreakdown: (breakdown: Partial<ActiveEventContext['pricingBreakdown']>) => void;
  calculateTotal: () => number;
  
  // Actions - Guests
  setEventGuests: (guests: EventGuest[]) => void;
  addGuest: (guest: EventGuest) => void;
  removeGuest: (guestId: string) => void;
  updateGuestStatus: (guestId: string, status: EventGuest['status']) => void;

  // Actions - Orders
  setEventOrders: (orders: EventOrder[]) => void;
  addOrder: (order: EventOrder) => void;
  updateOrder: (order: EventOrder) => void;
  
  // Actions - State
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  resetActiveContext: () => void;
  
  // Actions - Host Mode
  fetchHostEvents: (hostId: string) => Promise<void>;
  createHostEvent: (payload: Partial<Event>) => Promise<Event>;
  publishEvent: (eventId: string) => Promise<Event>;
  closeEvent: (eventId: string) => Promise<Event>;
}

export const useEventStore = create<EventState>((set, get) => ({
  // Initial state
  events: [],
  activeEventContext: null,
  currentEvent: null,
  eventGuests: [],
  eventOrders: [],
  isLoading: false,
  error: null,

  // Event Management
  setEvents: (events) => set({ events }),
  
  addEvent: (event) => set((state) => ({ 
    events: [...state.events, event] 
  })),
  
  updateEvent: (event) => set((state) => ({
    events: state.events.map((e) => e.id === event.id ? event : e),
    currentEvent: state.currentEvent?.id === event.id ? event : state.currentEvent,
  })),
  
  deleteEvent: (eventId) => set((state) => ({
    events: state.events.filter((e) => e.id !== eventId),
    currentEvent: state.currentEvent?.id === eventId ? null : state.currentEvent,
  })),

  // Active Event Context
  setActiveEventContext: (activeEventContext) => set({ activeEventContext }),
  
  setCurrentEvent: (currentEvent) => set({ currentEvent }),
  
  updateDistributionMode: (distributionMode) => set((state) => ({
    activeEventContext: state.activeEventContext 
      ? { ...state.activeEventContext, distributionMode }
      : null,
  })),
  
  setHostDeposit: (hostDeposit, hostDepositPercentage) => set((state) => ({
    activeEventContext: state.activeEventContext
      ? { 
          ...state.activeEventContext, 
          hostDeposit, 
          hostDepositPercentage 
        }
      : null,
  })),
  
  setSelectedFabric: (selectedFabric) => set((state) => ({
    activeEventContext: state.activeEventContext
      ? { ...state.activeEventContext, selectedFabric }
      : null,
  })),
  
  setPricingBreakdown: (breakdown) => set((state) => {
    if (!state.activeEventContext?.pricingBreakdown) return state;
    return {
      activeEventContext: {
        ...state.activeEventContext,
        pricingBreakdown: {
          ...state.activeEventContext.pricingBreakdown,
          ...breakdown,
        },
      },
    };
  }),
  
  calculateTotal: () => {
    const state = get();
    return state.activeEventContext?.pricingBreakdown?.total ?? 0;
  },

  // Guest Management
  setEventGuests: (eventGuests) => set({ eventGuests }),
  
  addGuest: (guest) => set((state) => ({
    eventGuests: [...state.eventGuests, guest],
  })),
  
  removeGuest: (guestId) => set((state) => ({
    eventGuests: state.eventGuests.filter((g) => g.id !== guestId),
  })),
  
  updateGuestStatus: (guestId, status) => set((state) => ({
    eventGuests: state.eventGuests.map((g) =>
      g.id === guestId ? { ...g, status } : g
    ),
  })),

  // Order Management
  setEventOrders: (eventOrders) => set({ eventOrders }),
  
  addOrder: (order) => set((state) => ({
    eventOrders: [...state.eventOrders, order],
  })),
  
  updateOrder: (order) => set((state) => ({
    eventOrders: state.eventOrders.map((o) =>
      o.id === order.id ? order : o
    ),
  })),

  // State Management
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  reset: () => set({
    events: [],
    activeEventContext: null,
    currentEvent: null,
    eventGuests: [],
    eventOrders: [],
    error: null,
  }),
  
  resetActiveContext: () => set({
    activeEventContext: null,
    currentEvent: null,
    eventGuests: [],
    eventOrders: [],
  }),
  
  /**
   * HOST-SPECIFIC METHODS
   * For host dashboard, event creation, and lifecycle management
   */
  
  /**
   * Fetch all events for current host
   */
  fetchHostEvents: async (hostId: string) => {
    set({ isLoading: true, error: null });
    try {
      const events = await eventSupabaseService.fetchHostEvents(hostId);
      set({ events });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch host events';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Create new event (starts as draft)
   */
  createHostEvent: async (payload: Partial<Event>) => {
    set({ isLoading: true, error: null });
    try {
      const event = await eventSupabaseService.createEvent(payload);
      set((state) => ({
        events: [event, ...state.events],
        currentEvent: event,
      }));
      return event;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create event';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Publish event (Draft → Live)
   * Events cannot be auto-published - must be explicit
   */
  publishEvent: async (eventId: string) => {
    set({ isLoading: true, error: null });
    try {
      const event = await eventSupabaseService.updateEventStatus(eventId, 'live');
      set((state) => ({
        events: state.events.map((e) => (e.id === eventId ? event : e)),
        currentEvent: state.currentEvent?.id === eventId ? event : state.currentEvent,
      }));
      return event;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish event';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Close event (Live → Closed)
   */
  closeEvent: async (eventId: string) => {
    set({ isLoading: true, error: null });
    try {
      const event = await eventSupabaseService.updateEventStatus(eventId, 'closed');
      set((state) => ({
        events: state.events.map((e) => (e.id === eventId ? event : e)),
        currentEvent: state.currentEvent?.id === eventId ? event : state.currentEvent,
      }));
      return event;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to close event';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
