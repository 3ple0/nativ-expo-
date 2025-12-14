import { View, Text, ScrollView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { theme } from '@/constants/theme';
import { getEventsAPI } from '@/src/api/events.api';

/**
 * EVENTS TAB SCREEN
 *
 * Browse and manage ASO-EBI events.
 * Lists events with:
 * - Event date
 * - Guest count
 * - Fabric status
 * - Quick link to event dashboard
 */
export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // TODO: Implement getEventsAPI call
      // const data = await getEventsAPI.list();
      // setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <View style={{ padding: 16 }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: theme.colors.neutral[900],
          marginBottom: 4,
        }}>
          Events
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.colors.neutral[600],
          marginBottom: 16,
        }}>
          Manage your ASO-EBI events
        </Text>

        <FlatList
          scrollEnabled={false}
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/events/${item.id}`)}
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: theme.colors.neutral[900],
                  }}>
                    {item.name}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.neutral[600],
                    marginTop: 4,
                  }}>
                    {item.eventDate ? new Date(item.eventDate).toLocaleDateString() : 'TBD'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.primary[600],
                    fontWeight: '600',
                  }}>
                    {item.guestCount || 0} guests
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
  );
}
