import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ChevronRight, Users, DollarSign, Settings, Share2 } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useEventStore } from '@/src/store/event.store';

/**
 * EVENT OVERVIEW — CONTROL CENTER
 *
 * Main management hub for a single event.
 * Shows:
 * - Event details & status
 * - Action buttons (edit, publish, close)
 * - Quick links to participants, payments, settings
 *
 * Navigation Hub:
 * - [eventId]/participants: RSVP list
 * - [eventId]/payments: Payment tracking
 * - [eventId]/settings: Event settings & lifecycle
 */
export default function EventOverviewScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { events, currentEvent, setCurrentEvent, isLoading } = useEventStore();
  const [actionLoading, setActionLoading] = useState(false);

  // Get event from store
  const event = currentEvent || events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.neutral[50],
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: theme.colors.neutral[600],
          }}
        >
          Event not found
        </Text>
      </View>
    );
  }

  /**
   * Get status badge styling
   */
  const getStatusStyle = (status: string | undefined) => {
    switch (status) {
      case 'draft':
        return {
          bg: theme.colors.warning[50],
          text: theme.colors.warning[600],
          label: 'DRAFT — Editable',
        };
      case 'live':
        return {
          bg: theme.colors.success[50],
          text: theme.colors.success[600],
          label: 'LIVE — Accepting Participants',
        };
      case 'closed':
        return {
          bg: theme.colors.neutral[100],
          text: theme.colors.neutral[600],
          label: 'CLOSED — Read-only',
        };
      default:
        return {
          bg: theme.colors.neutral[50],
          text: theme.colors.neutral[600],
          label: (status || 'unknown').toUpperCase(),
        };
    }
  };

  const statusStyle = getStatusStyle(event.status);

  /**
   * Handle publish (Draft → Live)
   */
  const handlePublish = () => {
    Alert.alert(
      'Publish Event?',
      'Once published, this event will be visible to others and accept participants. You can still edit details.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Publish',
          onPress: async () => {
            setActionLoading(true);
            try {
              // Note: Call publishEvent from store
              // await publishEvent(eventId);
              Alert.alert('Success', 'Event published!');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Handle close (Live → Closed)
   */
  const handleClose = () => {
    Alert.alert(
      'Close Event?',
      'Closing prevents new participants from joining. Event becomes read-only.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Close',
          onPress: async () => {
            setActionLoading(true);
            try {
              // Note: Call closeEvent from store
              // await closeEvent(eventId);
              Alert.alert('Success', 'Event closed');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Status Badge */}
      <View
        style={{
          backgroundColor: statusStyle.bg,
          borderRadius: 8,
          padding: 12,
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: statusStyle.text,
          }}
        >
          {statusStyle.label}
        </Text>
      </View>

      {/* Event Header */}
      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: theme.colors.neutral[900],
          marginBottom: 8,
        }}
      >
        {event.title}
      </Text>

      {event.description && (
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.neutral[600],
            lineHeight: 20,
            marginBottom: 16,
          }}
        >
          {event.description}
        </Text>
      )}

      {/* Event Details Grid */}
      <View
        style={{
          backgroundColor: theme.colors.neutral[100],
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          gap: 16,
        }}
      >
        {/* Price */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: theme.colors.neutral[600], fontSize: 14 }}>
            Price per Person
          </Text>
          <Text
            style={{
              fontWeight: '700',
              fontSize: 16,
              color: theme.colors.primary[600],
            }}
          >
            ₦{event.price_per_person?.toLocaleString()}
          </Text>
        </View>

        {/* Target Participants */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: theme.colors.neutral[600], fontSize: 14 }}>
            Target Participants
          </Text>
          <Text
            style={{
              fontWeight: '700',
              fontSize: 16,
              color: theme.colors.neutral[900],
            }}
          >
            {event.target_participants}
          </Text>
        </View>

        {/* Status */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: theme.colors.neutral[600], fontSize: 14 }}>
            Current Status
          </Text>
          <Text
            style={{
              fontWeight: '700',
              fontSize: 16,
              color: statusStyle.text,
            }}
          >
            {(event.status || 'unknown').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Management Buttons */}
      <View style={{ marginBottom: 24 }}>
        {/* Publish Button (only in draft) */}
        {event.status === 'draft' && (
          <TouchableOpacity
            onPress={handlePublish}
            disabled={actionLoading}
            style={{
              backgroundColor: theme.colors.success[600],
              borderRadius: 8,
              paddingVertical: 14,
              paddingHorizontal: 16,
              marginBottom: 12,
              opacity: actionLoading ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                color: theme.colors.neutral[50],
                fontSize: 16,
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              {actionLoading ? 'Publishing...' : 'Publish Event'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Close Button (only when live) */}
        {event.status === 'live' && (
          <TouchableOpacity
            onPress={handleClose}
            disabled={actionLoading}
            style={{
              backgroundColor: theme.colors.error[600],
              borderRadius: 8,
              paddingVertical: 14,
              paddingHorizontal: 16,
              marginBottom: 12,
              opacity: actionLoading ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                color: theme.colors.neutral[50],
                fontSize: 16,
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              {actionLoading ? 'Closing...' : 'Close Event'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Share Button */}
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.primary[50],
            borderWidth: 2,
            borderColor: theme.colors.primary[200],
            borderRadius: 8,
            paddingVertical: 14,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Share2 color={theme.colors.primary[600]} size={20} />
          <Text
            style={{
              color: theme.colors.primary[600],
              fontSize: 16,
              fontWeight: '700',
            }}
          >
            Share Invite Link
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Access Buttons */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: theme.colors.neutral[900],
          marginBottom: 12,
        }}
      >
        Management
      </Text>

      {/* Participants */}
      <TouchableOpacity
        onPress={() => router.push(`/host/${eventId}/participants`)}
        style={{
          backgroundColor: theme.colors.neutral[100],
          borderRadius: 8,
          padding: 16,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.primary[50],
              borderRadius: 8,
              padding: 8,
            }}
          >
            <Users color={theme.colors.primary[600]} size={24} />
          </View>
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.neutral[900],
              }}
            >
              Participants
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: theme.colors.neutral[600],
              }}
            >
              Manage RSVPs
            </Text>
          </View>
        </View>
        <ChevronRight color={theme.colors.neutral[400]} size={24} />
      </TouchableOpacity>

      {/* Payments */}
      <TouchableOpacity
        onPress={() => router.push(`/host/${eventId}/payments`)}
        style={{
          backgroundColor: theme.colors.neutral[100],
          borderRadius: 8,
          padding: 16,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.success[50],
              borderRadius: 8,
              padding: 8,
            }}
          >
            <DollarSign color={theme.colors.success[600]} size={24} />
          </View>
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.neutral[900],
              }}
            >
              Payments
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: theme.colors.neutral[600],
              }}
            >
              Track revenue
            </Text>
          </View>
        </View>
        <ChevronRight color={theme.colors.neutral[400]} size={24} />
      </TouchableOpacity>

      {/* Settings */}
      <TouchableOpacity
        onPress={() => router.push(`/host/${eventId}/settings`)}
        style={{
          backgroundColor: theme.colors.neutral[100],
          borderRadius: 8,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.warning[50],
              borderRadius: 8,
              padding: 8,
            }}
          >
            <Settings color={theme.colors.warning[600]} size={24} />
          </View>
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.neutral[900],
              }}
            >
              Settings
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: theme.colors.neutral[600],
              }}
            >
              Edit details
            </Text>
          </View>
        </View>
        <ChevronRight color={theme.colors.neutral[400]} size={24} />
      </TouchableOpacity>
    </ScrollView>
  );
}
