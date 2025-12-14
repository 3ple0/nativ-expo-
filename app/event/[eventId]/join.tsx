import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useParticipantStore } from '@/src/store/participant.store';
import { useEventStore } from '@/src/store/event.store';
import { useAuthStore } from '@/src/store/auth.store';
import { spacing, colors, typography } from '@/src/theme';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle, Users } from 'lucide-react-native';

/**
 * Join Event Screen
 *
 * Allows guests to join an event via invite link.
 * Accessible via: https://nativ.plus/event/[eventId]/join?code=[inviteCode]
 *
 * Flow:
 * 1. User taps invite link
 * 2. If not authenticated → Redirect to auth
 * 3. Validate invite code
 * 4. Add user to event_participants
 * 5. Redirect to event details
 */

export default function JoinEventScreen() {
  const { eventId, code } = useLocalSearchParams<{
    eventId: string;
    code: string;
  }>();

  const { user } = useAuthStore();
  const { joinEvent, isLoading: isParticipantLoading, error: participantError } =
    useParticipantStore();
  const { fetchEvent, activeEvent, isLoading: isEventLoading } = useEventStore();

  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load event details
  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId).catch((err: any) => {
        const message = err instanceof Error ? err.message : 'Failed to load event';
        setError(message);
      });
    }
  }, [eventId]);

  // Handle join
  const handleJoinEvent = async () => {
    // Check authentication
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to join this event', [
        {
          text: 'Sign In',
          onPress: () => router.push('/(auth)/sign-in'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    if (!eventId || !code) {
      Alert.alert('Error', 'Invalid invite link');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      await joinEvent(eventId, code);
      setHasJoined(true);

      Alert.alert('Welcome!', `You've successfully joined "${activeEvent?.title || 'the event'}"`, [
        {
          text: 'View Event',
          onPress: () => router.push(`/events/${eventId}`),
        },
        {
          text: 'Back Home',
          style: 'cancel',
          onPress: () => router.replace('/'),
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to join event';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setIsJoining(false);
    }
  };

  // Loading event details
  if (isEventLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.neutral[50],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text
          style={[
            typography.body2,
            {
              color: colors.neutral[600],
              marginTop: spacing.md,
            },
          ]}
        >
          Loading event...
        </Text>
      </View>
    );
  }

  // Event not found
  if (!activeEvent) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.neutral[50] }}>
        <View style={{ padding: spacing.lg, paddingTop: spacing.xl }}>
          <View
            style={{
              backgroundColor: colors.error[50],
              borderLeftWidth: 4,
              borderLeftColor: colors.error[500],
              padding: spacing.lg,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <AlertCircle size={48} color={colors.error[500]} />
            <Text
              style={[
                typography.heading3,
                {
                  color: colors.error[700],
                  marginTop: spacing.md,
                  textAlign: 'center',
                },
              ]}
            >
              Event Not Found
            </Text>
            <Text
              style={[
                typography.body2,
                {
                  color: colors.error[600],
                  marginTop: spacing.sm,
                  textAlign: 'center',
                },
              ]}
            >
              {error || 'The event you are trying to join does not exist.'}
            </Text>
          </View>

          <Button
            title="Go Home"
            onPress={() => router.replace('/')}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </ScrollView>
    );
  }

  // Already joined
  if (hasJoined) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.neutral[50] }}>
        <View style={{ padding: spacing.lg, paddingTop: spacing.xl }}>
          <View
            style={{
              backgroundColor: colors.success[50],
              borderLeftWidth: 4,
              borderLeftColor: colors.success[500],
              padding: spacing.lg,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <CheckCircle size={48} color={colors.success[500]} />
            <Text
              style={[
                typography.heading3,
                {
                  color: colors.success[700],
                  marginTop: spacing.md,
                  textAlign: 'center',
                },
              ]}
            >
              You're In!
            </Text>
            <Text
              style={[
                typography.body2,
                {
                  color: colors.success[600],
                  marginTop: spacing.sm,
                  textAlign: 'center',
                },
              ]}
            >
              You have successfully joined the event.
            </Text>
          </View>

          <Button
            title="View Event Details"
            onPress={() => router.push(`/events/${eventId}`)}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </ScrollView>
    );
  }

  // Invite confirmation screen
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.neutral[50] }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xl }}
    >
      {/* Event Card */}
      <View
        style={{
          backgroundColor: colors.white,
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: spacing.lg,
          borderWidth: 1,
          borderColor: colors.neutral[200],
        }}
      >
        {/* Event Image Placeholder */}
        <View
          style={{
            backgroundColor: colors.primary[100],
            height: 180,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Users size={64} color={colors.primary[500]} />
        </View>

        {/* Event Info */}
        <View style={{ padding: spacing.lg }}>
          <Text style={[typography.heading2, { color: colors.neutral[900] }]}>
            {activeEvent.title}
          </Text>

          {activeEvent.description && (
            <Text
              style={[
                typography.body2,
                {
                  color: colors.neutral[600],
                  marginTop: spacing.md,
                },
              ]}
            >
              {activeEvent.description}
            </Text>
          )}

          {/* Event Details */}
          <View
            style={{
              marginTop: spacing.lg,
              backgroundColor: colors.neutral[50],
              padding: spacing.md,
              borderRadius: 8,
            }}
          >
            {activeEvent.price_per_person && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: spacing.md,
                  paddingBottom: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.neutral[200],
                }}
              >
                <Text style={[typography.body2, { color: colors.neutral[600] }]}>
                  Price per Person
                </Text>
                <Text
                  style={[
                    typography.body2Bold,
                    { color: colors.primary[600] },
                  ]}
                >
                  ₦{activeEvent.price_per_person.toLocaleString()}
                </Text>
              </View>
            )}

            {activeEvent.target_participants && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={[typography.body2, { color: colors.neutral[600] }]}>
                  Expected Guests
                </Text>
                <Text
                  style={[
                    typography.body2Bold,
                    { color: colors.primary[600] },
                  ]}
                >
                  {activeEvent.target_participants}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Join Prompt */}
      <View
        style={{
          backgroundColor: colors.primary[50],
          borderLeftWidth: 4,
          borderLeftColor: colors.primary[500],
          padding: spacing.lg,
          borderRadius: 8,
          marginBottom: spacing.lg,
        }}
      >
        <Text style={[typography.heading3, { color: colors.primary[700] }]}>
          Ready to Join?
        </Text>
        <Text
          style={[
            typography.body2,
            {
              color: colors.primary[600],
              marginTop: spacing.sm,
            },
          ]}
        >
          Tap the button below to officially join this event. You'll be able to select your
          tailor and make payments.
        </Text>
      </View>

      {/* Error Alert */}
      {error && (
        <View
          style={{
            backgroundColor: colors.error[50],
            borderLeftWidth: 4,
            borderLeftColor: colors.error[500],
            padding: spacing.md,
            marginBottom: spacing.lg,
            borderRadius: 6,
            flexDirection: 'row',
            alignItems: 'flex-start',
          }}
        >
          <AlertCircle
            size={20}
            color={colors.error[500]}
            style={{ marginRight: spacing.sm, marginTop: spacing.xs }}
          />
          <Text
            style={[
              typography.body2,
              { color: colors.error[700], flex: 1 },
            ]}
          >
            {error}
          </Text>
        </View>
      )}

      {/* Join Button */}
      <Button
        title={isJoining ? 'Joining...' : 'Join Event'}
        onPress={handleJoinEvent}
        disabled={isJoining || isParticipantLoading || !user}
        accessibilityLabel="Join event"
      />

      {/* Auth Prompt */}
      {!user && (
        <View style={{ marginTop: spacing.lg }}>
          <Text
            style={[
              typography.body2,
              {
                color: colors.neutral[600],
                textAlign: 'center',
                marginBottom: spacing.md,
              },
            ]}
          >
            You need to be signed in to join
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/sign-in')}
            style={{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary[300] }}
          />
        </View>
      )}

      {/* Back Link */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ marginTop: spacing.lg, alignItems: 'center' }}
      >
        <Text style={[typography.body2, { color: colors.primary[600] }]}>
          Go Back
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
