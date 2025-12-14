import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';

/**
 * PARTICIPANTS SCREEN
 *
 * Manage RSVPs and guest list for the event.
 * Features:
 * - View all participants
 * - Payment status per participant
 * - Accept/decline/pending status
 * - Send reminders
 * - Export guest list
 *
 * TODO: Implement full participant management
 */
export default function ParticipantsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50], padding: 20 }}>
      <Text style={{ fontSize: 16, color: theme.colors.neutral[900] }}>
        Participants for event {eventId}
      </Text>
      <Text style={{ fontSize: 14, color: theme.colors.neutral[600], marginTop: 12 }}>
        Coming soon: Guest list, payment status, RSVP management
      </Text>
    </View>
  );
}
