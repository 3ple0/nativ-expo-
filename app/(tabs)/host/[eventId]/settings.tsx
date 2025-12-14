"use client";

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEventStore } from '@/src/store/event.store';
import { spacing, colors, typography } from '@/src/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, Check, ChevronDown } from 'lucide-react-native';
import type { DistributionMode, EventStatus } from '@/src/models/Event';

/**
 * EVENT SETTINGS SCREEN
 *
 * Edit event details and manage distribution mode.
 * Features:
 * - Edit title, description, price
 * - Set distribution mode (immutable after payments start)
 * - Manage event details
 * - Delete draft events
 *
 * Distribution Modes:
 * - host_purchase: Host pays upfront for all guests
 * - guest_self_purchase: Each guest pays individually
 * - mixed_deposit: Host pays deposit, guests pay remaining
 */

interface EventDetails {
  title: string;
  description: string;
  price_per_person: number;
  target_participants: number;
}

export default function SettingsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { activeEvent, updateActiveEvent, isLoading } = useEventStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetParticipants, setTargetParticipants] = useState('');
  const [pricePerPerson, setPricePerPerson] = useState('');
  const [distributionMode, setDistributionMode] = useState<DistributionMode | ''>('');
  const [showDistributionPicker, setShowDistributionPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modes: { value: DistributionMode; label: string; description: string }[] = [
    {
      value: 'host_purchase',
      label: 'Host Pays All',
      description: 'You pay upfront for all guests',
    },
    {
      value: 'guest_self_purchase',
      label: 'Guests Pay Individually',
      description: 'Each guest pays their own share',
    },
    {
      value: 'mixed_deposit',
      label: 'Mixed Deposit',
      description: 'You pay deposit, guests pay remaining',
    },
  ];

  // Initialize form with active event data
  useEffect(() => {
    if (activeEvent) {
      setTitle(activeEvent.title || '');
      setDescription(activeEvent.description || '');
      setTargetParticipants(activeEvent.target_participants?.toString() || '');
      setPricePerPerson(activeEvent.price_per_person?.toString() || '');
      setDistributionMode(activeEvent.distributionMode || '');
    }
  }, [activeEvent]);

  const handleSaveSettings = async () => {
    setError(null);

    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Event title is required');
      return;
    }

    const targetParts = parseInt(targetParticipants);
    if (isNaN(targetParts) || targetParts <= 0) {
      Alert.alert('Error', 'Target participants must be a positive number');
      return;
    }

    const price = parseFloat(pricePerPerson);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Price must be a positive number');
      return;
    }

    if (!distributionMode) {
      Alert.alert('Error', 'Please select a distribution mode');
      return;
    }

    setIsSaving(true);

    try {
      await updateActiveEvent({
        title,
        description,
        target_participants: targetParts,
        price_per_person: price,
        distributionMode: distributionMode as DistributionMode,
      });

      Alert.alert('Success', 'Event settings saved', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  const modeIsLocked = activeEvent?.status !== 'draft';
  const selectedMode = modes.find((m) => m.value === distributionMode);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1, backgroundColor: colors.neutral[50] }}>
        <View style={{ padding: spacing.lg }}>
          {/* Header */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={typography.heading3}>Event Settings</Text>
            <Text style={[typography.body2, { color: colors.neutral[600], marginTop: spacing.sm }]}>
              {activeEvent?.status === 'draft'
                ? 'Edit event details before publishing'
                : 'View event settings (read-only)'}
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

          {/* Info Box */}
          {modeIsLocked && (
            <View
              style={{
                backgroundColor: colors.warning[50],
                borderLeftWidth: 4,
                borderLeftColor: colors.warning[500],
                padding: spacing.md,
                marginBottom: spacing.lg,
                borderRadius: 6,
              }}
            >
              <Text style={[typography.body2Bold, { color: colors.warning[700] }]}>
                Read-only Mode
              </Text>
              <Text
                style={[typography.body3, { color: colors.warning[700], marginTop: spacing.xs }]}
              >
                Once an event is published, settings cannot be edited. Contact support to make
                changes.
              </Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={{ marginBottom: spacing.lg }}>
            {/* Title */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.label, { marginBottom: spacing.md }]}>Event Title</Text>
              <Input
                placeholder="e.g., Chioma's Birthday Aso-Ebi"
                value={title}
                onChangeText={setTitle}
                editable={activeEvent?.status === 'draft' && !isSaving}
              />
            </View>

            {/* Description */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.label, { marginBottom: spacing.md }]}>Description</Text>
              <Input
                placeholder="Brief description of the event"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                editable={activeEvent?.status === 'draft' && !isSaving}
              />
            </View>

            {/* Target Participants */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.label, { marginBottom: spacing.md }]}>Target Participants</Text>
              <Input
                placeholder="e.g., 50"
                value={targetParticipants}
                onChangeText={setTargetParticipants}
                keyboardType="number-pad"
                editable={activeEvent?.status === 'draft' && !isSaving}
              />
            </View>

            {/* Price Per Person */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.label, { marginBottom: spacing.md }]}>Price Per Person (₦)</Text>
              <Input
                placeholder="e.g., 50000"
                value={pricePerPerson}
                onChangeText={setPricePerPerson}
                keyboardType="decimal-pad"
                editable={activeEvent?.status === 'draft' && !isSaving}
              />
            </View>

            {/* Distribution Mode */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.label, { marginBottom: spacing.md }]}>
                Distribution Mode {modeIsLocked && '(Locked)'}
              </Text>

              {modeIsLocked ? (
                <View
                  style={{
                    backgroundColor: colors.neutral[100],
                    borderWidth: 1,
                    borderColor: colors.neutral[300],
                    borderRadius: 8,
                    padding: spacing.md,
                  }}
                >
                  <Text style={[typography.body2Bold, { color: colors.neutral[900] }]}>
                    {selectedMode?.label || 'Not set'}
                  </Text>
                  <Text
                    style={[
                      typography.body3,
                      { color: colors.neutral[600], marginTop: spacing.xs },
                    ]}
                  >
                    {selectedMode?.description}
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.warning[100],
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                      borderRadius: 4,
                      marginTop: spacing.sm,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={[typography.body3, { color: colors.warning[700], fontWeight: '600' }]}>
                      Immutable
                    </Text>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowDistributionPicker(!showDistributionPicker)}
                  disabled={isSaving}
                  style={{
                    backgroundColor: colors.white,
                    borderWidth: 1,
                    borderColor: colors.neutral[300],
                    borderRadius: 8,
                    padding: spacing.md,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        typography.body2,
                        { color: selectedMode ? colors.neutral[900] : colors.neutral[500] },
                      ]}
                    >
                      {selectedMode?.label || 'Select distribution mode'}
                    </Text>
                    {selectedMode && (
                      <Text
                        style={[
                          typography.body3,
                          { color: colors.neutral[600], marginTop: spacing.xs },
                        ]}
                      >
                        {selectedMode.description}
                      </Text>
                    )}
                  </View>
                  <ChevronDown
                    size={20}
                    color={colors.neutral[500]}
                    style={{ transform: [{ rotate: showDistributionPicker ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>
              )}

              {/* Mode Picker Dropdown */}
              {showDistributionPicker && (
                <View style={{ marginTop: spacing.sm }}>
                  {modes.map((mode) => (
                    <TouchableOpacity
                      key={mode.value}
                      onPress={() => {
                        setDistributionMode(mode.value);
                        setShowDistributionPicker(false);
                      }}
                      style={{
                        backgroundColor:
                          distributionMode === mode.value
                            ? colors.primary[50]
                            : colors.white,
                        borderWidth: 1,
                        borderColor:
                          distributionMode === mode.value
                            ? colors.primary[300]
                            : colors.neutral[200],
                        borderRadius: 6,
                        padding: spacing.md,
                        marginBottom: spacing.sm,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.body2Bold, { color: colors.neutral[900] }]}>
                          {mode.label}
                        </Text>
                        <Text
                          style={[
                            typography.body3,
                            { color: colors.neutral[600], marginTop: spacing.xs },
                          ]}
                        >
                          {mode.description}
                        </Text>
                      </View>
                      {distributionMode === mode.value && (
                        <Check size={20} color={colors.primary[600]} style={{ marginLeft: spacing.md }} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Save Button */}
          {activeEvent?.status === 'draft' && (
            <Button
              title={isSaving ? 'Saving...' : 'Save Settings'}
              onPress={handleSaveSettings}
              disabled={isSaving || isLoading}
              accessibilityLabel="Save event settings"
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

