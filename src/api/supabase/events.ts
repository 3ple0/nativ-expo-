import { supabase } from '@/lib/supabase';
import { Event, EventStatus } from '@/src/models/Event';

interface EventRow {
  id: string;
  user_id?: string;
  host_id?: string;
  title: string;
  description?: string;
  event_date?: string;
  location?: string;
  budget?: number;
  currency?: string;
  distribution_mode?: Event['distributionMode'];
  fabric_id?: string;
  price_per_person?: number;
  target_participants?: number;
  status?: EventStatus;
  created_at?: string;
  updated_at?: string;
}

const mapEventRow = (row: EventRow): Event => ({
  id: row.id,
  userId: row.user_id,
  hostId: row.host_id,
  title: row.title,
  description: row.description ?? undefined,
  eventDate: row.event_date ?? undefined,
  location: row.location ?? undefined,
  budget: row.budget ?? undefined,
  currency: row.currency ?? undefined,
  distributionMode: row.distribution_mode ?? undefined,
  fabricId: row.fabric_id ?? undefined,
  price_per_person: row.price_per_person ?? undefined,
  target_participants: row.target_participants ?? undefined,
  status: row.status ?? 'draft',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const serializeEventInput = (payload: Partial<Event>): Partial<EventRow> => ({
  user_id: payload.userId,
  host_id: payload.hostId,
  title: payload.title,
  description: payload.description,
  event_date: payload.eventDate,
  location: payload.location,
  budget: payload.budget,
  currency: payload.currency,
  distribution_mode: payload.distributionMode,
  fabric_id: payload.fabricId,
  price_per_person: payload.price_per_person,
  target_participants: payload.target_participants,
  status: payload.status,
});

export const eventSupabaseService = {
  async fetchHostEvents(hostId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from<EventRow>('events')
      .select('*')
      .eq('host_id', hostId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapEventRow);
  },

  async createEvent(payload: Partial<Event>): Promise<Event> {
    const insertPayload = serializeEventInput({
      ...payload,
      status: payload.status ?? 'draft',
    });

    const { data, error } = await supabase
      .from<EventRow>('events')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) throw error;
    return mapEventRow(data);
  },

  async updateEventStatus(eventId: string, status: EventStatus): Promise<Event> {
    const { data, error } = await supabase
      .from<EventRow>('events')
      .update({ status })
      .eq('id', eventId)
      .select('*')
      .single();

    if (error) throw error;
    return mapEventRow(data);
  },
};
