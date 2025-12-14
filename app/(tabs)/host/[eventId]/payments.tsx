import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';

/**
 * PAYMENTS SCREEN
 *
 * Track payments and revenue for the event.
 * Features:
 * - Revenue summary
 * - Payment per participant
 * - Escrow status
 * - Withdrawal/payout
 * - Transaction history
 *
 * TODO: Implement full payment tracking
 */
export default function PaymentsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50], padding: 20 }}>
      <Text style={{ fontSize: 16, color: theme.colors.neutral[900] }}>
        Payments for event {eventId}
      </Text>
      <Text style={{ fontSize: 14, color: theme.colors.neutral[600], marginTop: 12 }}>
        Coming soon: Revenue tracking, escrow status, payout management
      </Text>
    </View>
  );
}
