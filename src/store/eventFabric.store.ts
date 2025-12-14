import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

/**
 * Event Fabric Store
 * 
 * Manages fabric attachments to ASO-EBI events.
 * Hosts can attach one or more fabrics to an event,
 * and define the price per meter.
 */

export interface EventFabric {
  id: string;
  event_id: string;
  fabric_id: string;
  fabric_name?: string; // Denormalized for display
  price_per_meter: number;
  is_primary: boolean;
  created_at?: string;
}

interface EventFabricState {
  fabrics: EventFabric[];
  isLoading: boolean;
  error: string | null;

  // Fetch all fabrics attached to an event
  fetchEventFabrics: (eventId: string) => Promise<void>;

  // Attach a new fabric to an event
  attachFabric: (payload: Partial<EventFabric>) => Promise<void>;

  // Mark a fabric as primary
  setPrimaryFabric: (fabricId: string, eventId: string) => Promise<void>;

  // Remove fabric from event
  detachFabric: (eventFabricId: string) => Promise<void>;

  // Clear local state
  reset: () => void;
}

export const useEventFabricStore = create<EventFabricState>((set) => ({
  fabrics: [],
  isLoading: false,
  error: null,

  fetchEventFabrics: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('event_fabrics')
        .select('*')
        .eq('event_id', eventId)
        .order('is_primary', { ascending: false });

      if (error) throw error;

      set({ fabrics: data || [] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch fabrics';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  attachFabric: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('event_fabrics')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        fabrics: [...state.fabrics, data],
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to attach fabric';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  setPrimaryFabric: async (fabricId, eventId) => {
    set({ isLoading: true, error: null });
    try {
      // First, unset all primary fabrics for this event
      await supabase
        .from('event_fabrics')
        .update({ is_primary: false })
        .eq('event_id', eventId);

      // Then set the new primary
      const { data, error } = await supabase
        .from('event_fabrics')
        .update({ is_primary: true })
        .eq('id', fabricId)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        fabrics: state.fabrics.map((f) =>
          f.id === fabricId
            ? { ...f, is_primary: true }
            : { ...f, is_primary: false }
        ),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set primary fabric';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  detachFabric: async (eventFabricId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('event_fabrics')
        .delete()
        .eq('id', eventFabricId);

      if (error) throw error;

      set((state) => ({
        fabrics: state.fabrics.filter((f) => f.id !== eventFabricId),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to detach fabric';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({ fabrics: [], isLoading: false, error: null });
  },
}));
