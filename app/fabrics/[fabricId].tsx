import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { theme } from '@/constants/theme';

/**
 * FABRIC DETAIL SCREEN
 *
 * Detailed view of a specific fabric.
 * Shows:
 * - Large image gallery
 * - Pricing details
 * - Availability
 * - Add to order options
 */
export default function FabricDetailScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <View style={{ padding: 16 }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: theme.colors.neutral[900],
          marginBottom: 4,
        }}>
          Fabric Details
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.colors.neutral[600],
        }}>
          TODO: Implement fabric detail screen
        </Text>
      </View>
    </ScrollView>
  );
}
