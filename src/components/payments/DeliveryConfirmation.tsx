import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

/**
 * DeliveryConfirmation Component
 *
 * Non-negotiable delivery confirmation screen with photo proof requirement.
 *
 * Rules:
 * - Delivery MUST be confirmed before escrow release
 * - Photo proof is REQUIRED
 * - Once confirmed, funds release to seller
 * - Proof is immutable audit trail
 *
 * Usage:
 * ```tsx
 * <DeliveryConfirmation
 *   orderId="order_123"
 *   escrowId="escrow_456"
 *   amount={50000}
 *   onConfirm={(proofUrl) => handleConfirmDelivery(proofUrl)}
 * />
 * ```
 */

interface DeliveryConfirmationProps {
  orderId: string;
  escrowId: string;
  amount: number;
  currency?: string;
  sellerName?: string;
  onConfirm?: (proofUrl: string) => Promise<void>;
  onCancel?: () => void;
}

interface ConfirmationStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export const DeliveryConfirmation: React.FC<DeliveryConfirmationProps> = ({
  orderId,
  escrowId,
  amount,
  currency = 'USD',
  sellerName = 'Seller',
  onConfirm,
  onCancel,
}) => {
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [steps, setSteps] = useState<ConfirmationStep[]>([
    {
      id: 1,
      title: 'Receive Item',
      description: 'Verify you have received the complete order',
      completed: false,
    },
    {
      id: 2,
      title: 'Check Quality',
      description: 'Inspect fabric and tailoring quality',
      completed: false,
    },
    {
      id: 3,
      title: 'Take Photo',
      description: 'Upload proof photo of delivered item',
      completed: false,
    },
    {
      id: 4,
      title: 'Confirm',
      description: `Release ${currency} ${amount.toLocaleString()} to ${sellerName}`,
      completed: false,
    },
  ]);

  const handleStepToggle = (stepId: number) => {
    setSteps(
      steps.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const allStepsCompleted = steps.slice(0, 3).every((s) => s.completed);

  const handleConfirm = async () => {
    if (!selectedProof) {
      Alert.alert('Photo Required', 'Please upload a photo proof of delivery');
      return;
    }

    if (!allStepsCompleted) {
      Alert.alert('Confirm All Steps', 'Please confirm all delivery steps before releasing payment');
      return;
    }

    setIsConfirming(true);
    try {
      if (onConfirm) {
        await onConfirm(selectedProof);
      }
      setSteps((prev) => prev.map((s) => ({ ...s, completed: true })));
      Alert.alert('Success', 'Delivery confirmed. Payment released to seller.');
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm delivery. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Confirm Delivery</Text>
        <Text style={styles.subtitle}>Non-negotiable: Payment releases only after confirmation</Text>
      </View>

      {/* Order Info */}
      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.value}>{orderId.slice(0, 8)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.label}>Escrow Amount</Text>
          <Text style={styles.valueHighlight}>
            {currency} {amount.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Steps */}
      <View style={styles.stepsSection}>
        <Text style={styles.sectionTitle}>Delivery Verification</Text>
        {steps.map((step) => (
          <TouchableOpacity
            key={step.id}
            style={[styles.stepItem, step.completed && styles.stepItemCompleted]}
            onPress={() => step.id < 4 && handleStepToggle(step.id)}
            disabled={step.id === 4}
          >
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <View
                  style={[
                    styles.stepNumber,
                    step.completed && styles.stepNumberCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumberText,
                      step.completed && styles.stepNumberTextCompleted,
                    ]}
                  >
                    {step.completed ? '✓' : step.id}
                  </Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text
                    style={[
                      styles.stepTitle,
                      step.completed && styles.stepTitleCompleted,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Photo Upload Section */}
      <View style={styles.photoSection}>
        <Text style={styles.sectionTitle}>Upload Proof Photo</Text>
        <Text style={styles.photoDescription}>
          Photo serves as immutable audit trail for dispute resolution
        </Text>

        {selectedProof ? (
          <View style={styles.photoPreview}>
            <Text style={styles.photoPreviewText}>✓ Photo uploaded</Text>
            <Text style={styles.photoPath}>{selectedProof.slice(0, 30)}...</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.photoUploadButton}>
            <Text style={styles.photoUploadText}>📷 Select Photo from Gallery</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Warning */}
      <View style={styles.warning}>
        <Text style={styles.warningTitle}>⚠ Important</Text>
        <Text style={styles.warningText}>
          Confirming delivery will immediately release {currency} {amount.toLocaleString()} to {sellerName}. This action cannot be reversed.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!allStepsCompleted || !selectedProof) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!allStepsCompleted || !selectedProof || isConfirming}
        >
          <Text style={styles.confirmButtonText}>
            {isConfirming ? 'Confirming...' : 'Confirm Delivery'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Once confirmed, funds move to seller. You have{' '}
          <Text style={styles.footerHighlight}>30 days to dispute</Text> if issues arise.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
  },
  orderInfo: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.base,
    color: colors.gray600,
    fontWeight: typography.fontWeight.semibold,
  },
  value: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  valueHighlight: {
    fontSize: typography.fontSize.lg,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
  },
  stepsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  stepItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.gray300,
  },
  stepItemCompleted: {
    backgroundColor: colors.successLight,
    borderLeftColor: colors.success,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberCompleted: {
    backgroundColor: colors.success,
  },
  stepNumberText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray600,
  },
  stepNumberTextCompleted: {
    color: colors.white,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepTitleCompleted: {
    color: colors.success,
  },
  stepDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
  },
  photoSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  photoDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  photoUploadButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  photoUploadText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  photoPreview: {
    backgroundColor: colors.successLight,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  photoPreviewText: {
    fontSize: typography.fontSize.base,
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
  },
  photoPath: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  warning: {
    backgroundColor: colors.errorLight,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  warningTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.gray200,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  confirmButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  footer: {
    backgroundColor: colors.infoBg,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray700,
    lineHeight: 20,
  },
  footerHighlight: {
    fontWeight: typography.fontWeight.bold,
    color: colors.info,
  },
});
