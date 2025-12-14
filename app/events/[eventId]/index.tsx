import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';

/**
 * EVENT DASHBOARD SCREEN
 *
 * Main event management screen.
 * Shows:
 * - Event overview
 * - Fabric selection status
 * - Guest list
 * - Orders and fulfillment
 * - Distribution mode settings
 */
export default function EventDashboardScreen() {
  const { eventId } = useLocalSearchParams();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <View style={{ padding: 16 }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: theme.colors.neutral[900],
          marginBottom: 4,
        }}>
          Event Dashboard
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.colors.neutral[600],
          marginBottom: 16,
        }}>
          Event ID: {eventId}
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.colors.neutral[600],
        }}>
          TODO: Implement event dashboard screen
        </Text>
      </View>
    </ScrollView>
  );
}
