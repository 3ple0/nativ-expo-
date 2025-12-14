import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { theme } from '@/constants/theme';
import { useEventStore } from '@/src/store/event.store';
import { useAuthStore } from '@/src/store/auth.store';

/**
 * CREATE EVENT SCREEN
 *
 * Initial event creation form (DRAFT status).
 * Fields:
 * - Event Title
 * - Description
 * - Target Participants
 * - Price per Person
 *
 * Event starts as DRAFT (not published).
 * Can be edited until LIVE.
 * No auto-publish - must be explicit action.
 */
export default function CreateEventScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { createHostEvent, isLoading } = useEventStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetParticipants, setTargetParticipants] = useState('');
  const [pricePerPerson, setPricePerPerson] = useState('');
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate form before submission
   */
  const validateForm = (): boolean => {
    setError(null);

    if (!title.trim()) {
      setError('Event title is required');
      return false;
    }

    if (!targetParticipants.trim()) {
      setError('Target participants is required');
      return false;
    }

    if (!pricePerPerson.trim()) {
      setError('Price per person is required');
      return false;
    }

    const participants = parseInt(targetParticipants, 10);
    const price = parseFloat(pricePerPerson);

    if (isNaN(participants) || participants <= 0) {
      setError('Target participants must be a valid number');
      return false;
    }

    if (isNaN(price) || price <= 0) {
      setError('Price must be a valid number');
      return false;
    }

    return true;
  };

  /**
   * Create event (as draft)
   */
  const handleCreateEvent = async () => {
    if (!validateForm()) return;
    if (!user?.id) {
      setError('User not found');
      return;
    }

    try {
      await createHostEvent({
        hostId: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        target_participants: parseInt(targetParticipants, 10),
        price_per_person: parseFloat(pricePerPerson),
        status: 'draft',
      });

      Alert.alert(
        'Event Created',
        'Your event has been created as a draft. Edit details and publish when ready.',
        [{ text: 'OK', onPress: () => router.replace('/host') }]
      );
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
      Alert.alert('Error', err.message || 'Failed to create event');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
      >
        {/* Intro Text */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.neutral[900],
            marginBottom: 8,
          }}
        >
          Create New Event
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.neutral[600],
            marginBottom: 24,
            lineHeight: 20,
          }}
        >
          Start by creating your event as a draft. You can edit details and add fabrics before publishing.
        </Text>

        {/* Error Display */}
        {error && (
          <View
            style={{
              backgroundColor: theme.colors.error[50],
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                color: theme.colors.error[600],
                fontSize: 13,
              }}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Event Title */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.neutral[900],
              marginBottom: 8,
            }}
          >
            Event Title *
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.colors.neutral[100],
              borderWidth: 1,
              borderColor: theme.colors.neutral[200],
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 14,
              color: theme.colors.neutral[900],
            }}
            placeholder="e.g., Ajo's 50th Birthday Celebration"
            placeholderTextColor={theme.colors.neutral[400]}
            value={title}
            onChangeText={setTitle}
            editable={!isLoading}
          />
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.neutral[500],
              marginTop: 6,
            }}
          >
            Make it memorable and clear
          </Text>
        </View>

        {/* Description */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.neutral[900],
              marginBottom: 8,
            }}
          >
            Description
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.colors.neutral[100],
              borderWidth: 1,
              borderColor: theme.colors.neutral[200],
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 14,
              color: theme.colors.neutral[900],
              minHeight: 100,
              textAlignVertical: 'top',
            }}
            placeholder="Tell guests what this event is about..."
            placeholderTextColor={theme.colors.neutral[400]}
            value={description}
            onChangeText={setDescription}
            multiline
            editable={!isLoading}
          />
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.neutral[500],
              marginTop: 6,
            }}
          >
            Optional: Add dress code, theme, or special details
          </Text>
        </View>

        {/* Target Participants */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.neutral[900],
              marginBottom: 8,
            }}
          >
            Target Participants *
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.colors.neutral[100],
              borderWidth: 1,
              borderColor: theme.colors.neutral[200],
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 14,
              color: theme.colors.neutral[900],
            }}
            placeholder="e.g., 50"
            placeholderTextColor={theme.colors.neutral[400]}
            value={targetParticipants}
            onChangeText={setTargetParticipants}
            keyboardType="number-pad"
            editable={!isLoading}
          />
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.neutral[500],
              marginTop: 6,
            }}
          >
            Expected number of guests (for planning)
          </Text>
        </View>

        {/* Price per Person */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.neutral[900],
              marginBottom: 8,
            }}
          >
            Price per Person (₦) *
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.colors.neutral[100],
              borderWidth: 1,
              borderColor: theme.colors.neutral[200],
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 14,
              color: theme.colors.neutral[900],
            }}
            placeholder="e.g., 50000"
            placeholderTextColor={theme.colors.neutral[400]}
            value={pricePerPerson}
            onChangeText={setPricePerPerson}
            keyboardType="decimal-pad"
            editable={!isLoading}
          />
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.neutral[500],
              marginTop: 6,
            }}
          >
            Cost per guest (you can adjust later)
          </Text>
        </View>

        {/* Info Box */}
        <View
          style={{
            backgroundColor: theme.colors.primary[50],
            borderRadius: 8,
            padding: 12,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.neutral[700],
              lineHeight: 18,
            }}
          >
            ℹ️ Events start as <Text style={{ fontWeight: '600' }}>DRAFT</Text> and are not visible to others yet. You can add fabrics and customize settings before going live.
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Create Button */}
        <TouchableOpacity
          onPress={handleCreateEvent}
          disabled={isLoading}
          style={{
            backgroundColor: theme.colors.primary[600],
            borderRadius: 8,
            paddingVertical: 14,
            alignItems: 'center',
            opacity: isLoading ? 0.6 : 1,
            marginBottom: 12,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.neutral[50]} />
          ) : (
            <Text
              style={{
                color: theme.colors.neutral[50],
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              Create Event
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={isLoading}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.neutral[200],
            borderRadius: 8,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: theme.colors.neutral[700],
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
