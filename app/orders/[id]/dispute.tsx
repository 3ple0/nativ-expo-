import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { spacing, colors } from '@/src/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, Flag, FileText } from 'lucide-react-native';

/**
 * Dispute Flow (U4)
 * 
 * Allows buyer or maker to raise disputes before escrow release.
 */

interface DisputeReason {
  id: string;
  label: string;
  description: string;
}

const DISPUTE_REASONS: DisputeReason[] = [
  {
    id: 'quality_issue',
    label: 'Quality Issue',
    description: 'Fabric or tailoring quality below expectations',
  },
  {
    id: 'incorrect_size',
    label: 'Incorrect Size',
    description: 'Order does not match specified measurements',
  },
  {
    id: 'delayed_delivery',
    label: 'Delayed Delivery',
    description: 'Not delivered within agreed timeline',
  },
  {
    id: 'wrong_fabric',
    label: 'Wrong Fabric',
    description: 'Different fabric than ordered',
  },
  {
    id: 'damaged_goods',
    label: 'Damaged Goods',
    description: 'Arrived with tears, stains, or damage',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Something else (describe below)',
  },
];

export default function RaiseDisputeScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAgreed, setHasAgreed] = useState(false);

  const handleSubmitDispute = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a dispute reason');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the issue in detail');
      return;
    }

    if (!hasAgreed) {
      Alert.alert('Error', 'Please agree to dispute terms');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Submit dispute to API

      Alert.alert('Dispute Raised', 'Your dispute has been submitted. Escrow is now frozen pending admin review.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to raise dispute';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReasonData = DISPUTE_REASONS.find(
    (r) => r.id === selectedReason
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1, backgroundColor: colors.neutral[50] }}>
        <View style={{ padding: spacing.lg }}>
          {/* Header */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.neutral[900] }}>
              Raise Dispute
            </Text>
            <Text style={{ fontSize: 16, lineHeight: 24, color: colors.neutral[600], marginTop: spacing.sm }}>
              Protect your payment by reporting issues
            </Text>
          </View>

          {/* Warning */}
          <View
            style={{
              backgroundColor: colors.warning[50],
              borderLeftWidth: 4,
              borderLeftColor: colors.warning[500],
              padding: spacing.lg,
              borderRadius: 8,
              marginBottom: spacing.lg,
              flexDirection: 'row',
            }}
          >
            <AlertCircle size={20} color={colors.warning[500]} style={{ marginRight: spacing.md, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.warning[700] }}>
                Escrow Will Be Frozen
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.warning[700], marginTop: spacing.xs }}>
                Your payment will be held until an admin reviews and resolves this dispute.
              </Text>
            </View>
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
              }}
            >
              <Text style={{ fontSize: 16, lineHeight: 24, color: colors.error[700] }}>
                {error}
              </Text>
            </View>
          )}

          {/* Dispute Reason Selection */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: spacing.md, letterSpacing: 0.5 }}>
              What's the Issue?
            </Text>

            {DISPUTE_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                onPress={() => setSelectedReason(reason.id)}
                style={{
                  backgroundColor:
                    selectedReason === reason.id
                      ? colors.primary[50]
                      : colors.white,
                  borderWidth: selectedReason === reason.id ? 2 : 1,
                  borderColor:
                    selectedReason === reason.id
                      ? colors.primary[300]
                      : colors.neutral[200],
                  borderRadius: 8,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor:
                      selectedReason === reason.id
                        ? colors.primary[600]
                        : colors.neutral[300],
                    backgroundColor:
                      selectedReason === reason.id
                        ? colors.primary[600]
                        : 'transparent',
                    marginRight: spacing.md,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      lineHeight: 24,
                      fontWeight: '600',
                      color:
                        selectedReason === reason.id
                          ? colors.primary[900]
                          : colors.neutral[900],
                    }}
                  >
                    {reason.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      color:
                        selectedReason === reason.id
                          ? colors.primary[700]
                          : colors.neutral[600],
                      marginTop: spacing.xs,
                    }}
                  >
                    {reason.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Detailed Description */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: spacing.md, letterSpacing: 0.5 }}>
              Describe the Issue
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 20, color: colors.neutral[600], marginBottom: spacing.sm }}>
              Be as detailed as possible. Include dates, specific problems, and impact on your order.
            </Text>
            <Input
              placeholder="Describe what went wrong..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              editable={!isSubmitting}
              style={{ textAlignVertical: 'top' }}
            />
          </View>

          {/* Evidence/Documentation */}
          <View
            style={{
              backgroundColor: colors.neutral[50],
              borderWidth: 1,
              borderColor: colors.neutral[200],
              borderRadius: 8,
              padding: spacing.lg,
              marginBottom: spacing.lg,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
              <FileText size={20} color={colors.neutral[600]} style={{ marginRight: spacing.sm }} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.neutral[900] }}>
                Add Evidence (Optional)
              </Text>
            </View>
            <Text style={{ fontSize: 14, lineHeight: 20, color: colors.neutral[600] }}>
              Photos of damaged items or incorrect deliveries help resolve disputes faster
            </Text>

            <TouchableOpacity
              disabled={isSubmitting}
              style={{
                backgroundColor: colors.white,
                borderWidth: 2,
                borderColor: colors.neutral[300],
                borderStyle: 'dashed',
                borderRadius: 8,
                padding: spacing.lg,
                alignItems: 'center',
                marginTop: spacing.md,
              }}
            >
              <Text style={{ fontSize: 16, lineHeight: 24, color: colors.primary[600], marginBottom: spacing.sm }}>
                📸 Upload Photos
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.neutral[600], textAlign: 'center' }}>
                Tap to add photos of the issue (coming soon)
              </Text>
            </TouchableOpacity>
          </View>

          {/* What Happens Next */}
          <View
            style={{
              backgroundColor: colors.info[50],
              borderLeftWidth: 4,
              borderLeftColor: colors.info[500],
              padding: spacing.lg,
              borderRadius: 8,
              marginBottom: spacing.lg,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.info[700], marginBottom: spacing.md }}>
              What Happens Next?
            </Text>
            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.info[700], marginRight: spacing.sm }}>
                  1.
                </Text>
                <Text style={{ fontSize: 14, lineHeight: 20, color: colors.info[700], flex: 1 }}>
                  Your dispute is reviewed by our team (usually within 24 hours)
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.info[700], marginRight: spacing.sm }}>
                  2.
                </Text>
                <Text style={{ fontSize: 14, lineHeight: 20, color: colors.info[700], flex: 1 }}>
                  We may request additional information or photos
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.info[700], marginRight: spacing.sm }}>
                  3.
                </Text>
                <Text style={{ fontSize: 14, lineHeight: 20, color: colors.info[700], flex: 1 }}>
                  Admin decides: Refund you or release to maker
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.info[700], marginRight: spacing.sm }}>
                  4.
                </Text>
                <Text style={{ fontSize: 14, lineHeight: 20, color: colors.info[700], flex: 1 }}>
                  You'll be notified of the resolution
                </Text>
              </View>
            </View>
          </View>

          {/* Terms Agreement */}
          <TouchableOpacity
            onPress={() => setHasAgreed(!hasAgreed)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.lg,
              paddingVertical: spacing.md,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: hasAgreed ? colors.primary[600] : colors.neutral[300],
                backgroundColor: hasAgreed ? colors.primary[600] : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md,
              }}
            >
              {hasAgreed && (
                <Text style={{ color: colors.white, fontSize: 12, fontWeight: 'bold' }}>
                  ✓
                </Text>
              )}
            </View>
            <Text style={{ fontSize: 16, lineHeight: 24, color: colors.neutral[700], flex: 1 }}>
              I understand disputes are subject to admin review and resolution decisions are final
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <Button
            title={isSubmitting ? 'Submitting...' : 'Submit Dispute'}
            onPress={handleSubmitDispute}
            disabled={isSubmitting || !selectedReason || !description.trim() || !hasAgreed}
          />

          {/* Cancel Link */}
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={isSubmitting}
            style={{ alignItems: 'center', marginTop: spacing.lg }}
          >
            <Text style={{ fontSize: 16, lineHeight: 24, color: colors.primary[600] }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
