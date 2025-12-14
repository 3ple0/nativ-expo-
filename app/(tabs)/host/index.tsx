import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Plus, Eye } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useEventStore } from '@/src/store/event.store';
import { useAuthStore } from '@/src/store/auth.store';

/**
 * HOST DASHBOARD
 *
 * Main screen for host mode.
 * Shows:
 * - Button to create new event
 * - List of host's events (with status badges)
 * - Quick access to participants, payments, settings per event
 *
 * Event Status Badges:
 * - Draft: Yellow (editable)
 * - Live: Green (accepting participants)
 * - Closed: Gray (read-only)
 */
export default function HostDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { events, fetchHostEvents, isLoading } = useEventStore();
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load events when screen comes into focus
   */
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchHostEvents(user.id);
      }
    }, [user?.id, fetchHostEvents])
  );

  /**
   * Pull-to-refresh
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.id) {
      await fetchHostEvents(user.id);
    }
    setRefreshing(false);
  }, [user?.id, fetchHostEvents]);

  /**
   * Get badge color based on event status
   */
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'draft':
        return theme.colors.warning[50];
      case 'live':
        return theme.colors.success[50];
      case 'closed':
        return theme.colors.neutral[100];
      default:
        return theme.colors.neutral[50];
    }
  };

  const getStatusTextColor = (status: string | undefined) => {
    switch (status) {
      case 'draft':
        return theme.colors.warning[600];
      case 'live':
        return theme.colors.success[600];
      case 'closed':
        return theme.colors.neutral[600];
      default:
        return theme.colors.neutral[600];
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 8,
          backgroundColor: theme.colors.neutral[50],
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: theme.colors.neutral[900],
            marginBottom: 4,
          }}
        >
          My Events
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.neutral[600],
            marginBottom: 16,
          }}
        >
          Create and manage your ASO-EBI events
        </Text>

        {/* Create Event Button */}
        <TouchableOpacity
          onPress={() => router.push('/host/create')}
          style={{
            backgroundColor: theme.colors.primary[600],
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Plus color={theme.colors.neutral[50]} size={20} />
          <Text
            style={{
              color: theme.colors.neutral[50],
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            Create Event
          </Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      {isLoading && !refreshing ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        </View>
      ) : events.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.neutral[600],
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            No events yet
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.neutral[500],
              textAlign: 'center',
            }}
          >
            Create your first ASO-EBI event to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/host/${item.id}`)}
              style={{
                marginHorizontal: 16,
                marginVertical: 8,
                backgroundColor: theme.colors.neutral[50],
                borderRadius: 12,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: theme.colors.neutral[200],
              }}
            >
              {/* Event Card */}
              <View style={{ padding: 16 }}>
                {/* Title & Status Badge */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8,
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 16,
                      fontWeight: '700',
                      color: theme.colors.neutral[900],
                    }}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <View
                    style={{
                      backgroundColor: getStatusColor(item.status),
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: getStatusTextColor(item.status),
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Event Details */}
                <View style={{ marginBottom: 12 }}>
                  {item.description && (
                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.colors.neutral[600],
                        marginBottom: 8,
                        lineHeight: 20,
                      }}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  )}

                  {/* Price per person */}
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.colors.primary[600],
                    }}
                  >
                    ₦{item.price_per_person?.toLocaleString() || 'TBD'}
                  </Text>
                </View>

                {/* Stats Row */}
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 16,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.neutral[200],
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.colors.neutral[500],
                        marginBottom: 4,
                      }}
                    >
                      Participants
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: theme.colors.neutral[900],
                      }}
                    >
                      0/{item.target_participants}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.colors.neutral[500],
                        marginBottom: 4,
                      }}
                    >
                      Revenue
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: theme.colors.neutral[900],
                      }}
                    >
                      ₦0
                    </Text>
                  </View>

                  <View
                    style={{
                      paddingVertical: 8,
                      paddingLeft: 8,
                    }}
                  >
                    <Eye color={theme.colors.primary[600]} size={24} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 32 }}
          scrollEnabled={true}
        />
      )}
    </View>
  );
}
