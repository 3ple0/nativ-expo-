import { View, Text, ScrollView } from 'react-native';
import { theme } from '@/constants/theme';

/**
 * MAKER PROFILE SCREEN
 *
 * Detailed view of a maker/tailor.
 * Shows:
 * - Profile information
 * - Portfolio
 * - Reviews and ratings
 * - Booking options
 */
export default function MakerProfileScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <View style={{ padding: 16 }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: theme.colors.neutral[900],
          marginBottom: 4,
        }}>
          Maker Profile
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.colors.neutral[600],
        }}>
          TODO: Implement maker profile screen
        </Text>
      </View>
    </ScrollView>
  );
}
