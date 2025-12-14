import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { theme } from '@/constants/theme';

/**
 * CREATE EVENT SCREEN
 *
 * Create new ASO-EBI event.
 * Form fields:
 * - Event name
 * - Event date
 * - Budget/pricing
 * - Distribution mode (host purchase / guest self-purchase / mixed)
 */
export default function CreateEventScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    date: null as string | null,
    distributionMode: 'host_purchase' as 'host_purchase' | 'guest_self_purchase' | 'mixed_deposit',
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <View style={{ padding: 16 }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: theme.colors.neutral[900],
          marginBottom: 4,
        }}>
          Create Event
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.colors.neutral[600],
          marginBottom: 16,
        }}>
          Set up your ASO-EBI event
        </Text>

        {/* TODO: Implement form fields */}
        <View style={{
          backgroundColor: theme.colors.white,
          borderRadius: 12,
          padding: 16,
          minHeight: 200,
          elevation: 2,
        }}>
          <Text style={{
            fontSize: 14,
            color: theme.colors.neutral[600],
          }}>
            Form fields coming soon...
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
