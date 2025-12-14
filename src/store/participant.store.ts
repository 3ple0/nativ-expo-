import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

/**
 * Participant Store
 *
 * Manages event participants, invite links, and RSVP tracking.
 * Tracks participant status: invited → joined → confirmed
 */

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id?: string;
  email?: string;
  display_name?: string;
  status: 'invited' | 'joined' | 'confirmed';
  invite_code?: string;
  joined_at?: string;
  created_at?: string;
}

export interface InviteLink {
  event_id: string;
  invite_code: string;
  invite_url: string;
  expires_at?: string;
}

interface ParticipantState {
  participants: EventParticipant[];
  inviteLinks: InviteLink[];
  isLoading: boolean;
  error: string | null;

  // Fetch all participants for an event
  fetchEventParticipants: (eventId: string) => Promise<void>;

  // Add participant to event (by email)
  addParticipant: (eventId: string, email: string) => Promise<void>;

  // Generate invite link
  generateInviteLink: (eventId: string) => Promise<InviteLink>;

  // Join event (guest flow)
  joinEvent: (eventId: string, inviteCode: string) => Promise<void>;

  // Confirm participant (mark as ready)
  confirmParticipant: (participantId: string) => Promise<void>;

  // Remove participant from event
  removeParticipant: (participantId: string) => Promise<void>;

  // Get invite link for event
  getInviteLink: (eventId: string) => Promise<InviteLink | null>;

  // Clear local state
  reset: () => void;
}

/**
 * Generate a unique invite code (8 alphanumeric characters)
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const useParticipantStore = create<ParticipantState>((set) => ({
  participants: [],
  inviteLinks: [],
  isLoading: false,
  error: null,

  fetchEventParticipants: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ participants: data || [] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch participants';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  addParticipant: async (eventId, email) => {
    set({ isLoading: true, error: null });
    try {
      const inviteCode = generateInviteCode();

      const { data, error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          email,
          status: 'invited',
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        participants: [...state.participants, data],
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add participant';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  generateInviteLink: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      // Check if invite link already exists
      const { data: existing } = await supabase
        .from('event_invite_links')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (existing) {
        set((state) => ({
          inviteLinks: state.inviteLinks.map((l) =>
            l.event_id === eventId ? existing : l
          ),
        }));
        return existing;
      }

      // Generate new invite code
      const inviteCode = generateInviteCode();
      const inviteUrl = `https://nativ.plus/event/${eventId}/join?code=${inviteCode}`;

      const { data, error } = await supabase
        .from('event_invite_links')
        .insert({
          event_id: eventId,
          invite_code: inviteCode,
          invite_url: inviteUrl,
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        inviteLinks: [...state.inviteLinks, data],
      }));

      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate invite link';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  joinEvent: async (eventId, inviteCode) => {
    set({ isLoading: true, error: null });
    try {
      // Validate invite code
      const { data: validInvite, error: inviteError } = await supabase
        .from('event_invite_links')
        .select('*')
        .eq('event_id', eventId)
        .eq('invite_code', inviteCode)
        .single();

      if (inviteError || !validInvite) {
        throw new Error('Invalid or expired invite code');
      }

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Authentication required');
      }

      // Add participant or update status
      const { data: existing } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update status to joined
        const { error: updateError } = await supabase
          .from('event_participants')
          .update({ status: 'joined', joined_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Create new participant
        const { error: insertError } = await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            user_id: user.id,
            email: user.email,
            status: 'joined',
            joined_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      }

      // Refresh participants list
      await useParticipantStore.getState().fetchEventParticipants(eventId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join event';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  confirmParticipant: async (participantId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('event_participants')
        .update({ status: 'confirmed' })
        .eq('id', participantId);

      if (error) throw error;

      set((state) => ({
        participants: state.participants.map((p) =>
          p.id === participantId ? { ...p, status: 'confirmed' } : p
        ),
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to confirm participant';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  removeParticipant: async (participantId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      set((state) => ({
        participants: state.participants.filter((p) => p.id !== participantId),
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove participant';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  getInviteLink: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('event_invite_links')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // 'not found' is ok

      if (data) {
        set((state) => ({
          inviteLinks: state.inviteLinks.some((l) => l.event_id === eventId)
            ? state.inviteLinks
            : [...state.inviteLinks, data],
        }));
      }

      return data || null;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to get invite link';
      set({ error: message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({ participants: [], inviteLinks: [], isLoading: false, error: null });
  },
}));
