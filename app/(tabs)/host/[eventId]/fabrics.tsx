import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEventFabricStore } from '@/src/store/eventFabric.store';
import { useFabricStore } from '@/src/store/fabric.store';
import { spacing, colors, typography } from '@/src/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { X, ChevronRight, AlertCircle } from 'lucide-react-native';

/**
 * Attach Fabric Screen
 * 
 * Allows hosts to attach one or more fabrics to an event
 * and set the price per meter for each fabric.
 */

export default function AttachFabricScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { fabrics: eventFabrics, attachFabric, detachFabric, isLoading: isFabricLoading } =
    useEventFabricStore();
  
  // Assuming a fabric store exists for browsing available fabrics
  const fabricStore = useFabricStore?.() || { fabrics: [] };
  
  const [selectedFabricId, setSelectedFabricId] = useState<string>('');
  const [pricePerMeter, setPricePerMeter] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch event fabrics on mount
  useEffect(() => {
    if (eventId) {
      const fetchData = async () => {
        try {
          await useEventFabricStore.getState().fetchEventFabrics(eventId);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load fabrics');
        }
      };
      fetchData();
    }
  }, [eventId]);

  const handleAttachFabric = async () => {
    // Validation
    if (!selectedFabricId.trim()) {
      Alert.alert('Error', 'Please select a fabric');
      return;
    }

    if (!pricePerMeter.trim()) {
      Alert.alert('Error', 'Please enter price per meter');
      return;
    }

    const price = parseFloat(pricePerMeter);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Price must be a positive number');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await attachFabric({
        event_id: eventId,
        fabric_id: selectedFabricId,
        price_per_meter: price,
        is_primary: eventFabrics.length === 0, // First fabric is primary
      });

      Alert.alert('Success', 'Fabric attached to event');
      setSelectedFabricId('');
      setPricePerMeter('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to attach fabric';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFabric = (fabricId: string) => {
    Alert.alert('Remove Fabric', 'Are you sure? This will remove the fabric from the event.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await detachFabric(fabricId);
            Alert.alert('Success', 'Fabric removed from event');
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to remove fabric';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1, backgroundColor: colors.neutral[50] }}>
        <View style={{ padding: spacing.lg }}>
          {/* Header */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={typography.heading3}>Attach Fabrics</Text>
            <Text style={[typography.body2, { color: colors.neutral[600], marginTop: spacing.sm }]}>
              Add one or more fabrics to this event and set pricing
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
              <AlertCircle size={20} color={colors.error[500]} style={{ marginRight: spacing.sm }} />
              <Text style={[typography.body2, { color: colors.error[700], flex: 1 }]}>{error}</Text>
            </View>
          )}

          {/* Attached Fabrics List */}
          {eventFabrics.length > 0 && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.label, { marginBottom: spacing.md }]}>
                Attached Fabrics ({eventFabrics.length})
              </Text>

              <FlatList
                scrollEnabled={false}
                data={eventFabrics}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View
                    style={{
                      backgroundColor: colors.white,
                      padding: spacing.md,
                      marginBottom: spacing.sm,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.neutral[200],
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={typography.body2Bold}>{item.fabric_name || 'Fabric'}</Text>
                      <Text style={[typography.body3, { color: colors.neutral[600], marginTop: spacing.xs }]}>
                        ₦{item.price_per_meter.toLocaleString()} per meter
                      </Text>
                      {item.is_primary && (
                        <View
                          style={{
                            backgroundColor: colors.success[100],
                            paddingHorizontal: spacing.sm,
                            paddingVertical: spacing.xs,
                            borderRadius: 4,
                            marginTop: spacing.xs,
                            alignSelf: 'flex-start',
                          }}
                        >
                          <Text style={[typography.body3, { color: colors.success[700], fontWeight: '600' }]}>
                            Primary
                          </Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveFabric(item.id)}
                      style={{
                        padding: spacing.sm,
                        backgroundColor: colors.error[50],
                        borderRadius: 6,
                      }}
                    >
                      <X size={18} color={colors.error[500]} />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}

          {/* Add Fabric Form */}
          <View
            style={{
              backgroundColor: colors.white,
              padding: spacing.lg,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.neutral[200],
            }}
          >
            <Text style={[typography.label, { marginBottom: spacing.lg }]}>Add New Fabric</Text>

            {/* Fabric Selection */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.label, { marginBottom: spacing.md }]}>Select Fabric</Text>
              <TouchableOpacity
                onPress={() => router.push(`/discover?attachTo=${eventId}`)}
                style={{
                  backgroundColor: colors.neutral[100],
                  borderWidth: 1,
                  borderColor: colors.neutral[300],
                  borderRadius: 8,
                  padding: spacing.md,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={[
                    typography.body2,
                    { color: selectedFabricId ? colors.neutral[900] : colors.neutral[500] },
                  ]}
                >
                  {selectedFabricId ? 'Fabric Selected' : 'Tap to browse fabrics'}
                </Text>
                <ChevronRight size={20} color={colors.neutral[500]} />
              </TouchableOpacity>
            </View>

            {/* Price Input */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.label, { marginBottom: spacing.md }]}>Price Per Meter (₦)</Text>
              <Input
                placeholder="e.g., 15000"
                value={pricePerMeter}
                onChangeText={setPricePerMeter}
                keyboardType="decimal-pad"
                editable={!isSubmitting}
              />
            </View>

            {/* Submit Button */}
            <Button
              title={isSubmitting ? 'Adding...' : 'Add Fabric'}
              onPress={handleAttachFabric}
              disabled={isSubmitting || isFabricLoading}
              accessibilityLabel="Add fabric to event"
            />
          </View>

          {/* Browse Button */}
          <TouchableOpacity
            onPress={() => router.push(`/discover?attachTo=${eventId}`)}
            style={{
              marginTop: spacing.lg,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              backgroundColor: colors.primary[100],
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={[typography.body2Bold, { color: colors.primary[600] }]}>
              Browse All Fabrics
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
