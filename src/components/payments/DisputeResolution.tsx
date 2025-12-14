import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

/**
 * DisputeResolution Component
 *
 * Handles dispute initiation, evidence submission, and resolution.
 *
 * Non-negotiable rules:
 * - Must provide detailed reason
 * - Photo/evidence required
 * - 30-day dispute window
 * - Neutral mediator determines split
 *
 * States:
 * 1. Initiate - Gather evidence and reason
 * 2. Submitted - Awaiting seller response
 * 3. Reviewing - Neutral mediator reviewing
 * 4. Resolved - Split determined and executed
 *
 * Usage:
 * ```tsx
 * <DisputeResolution
 *   orderId="order_123"
 *   escrowId="escrow_456"
 *   amount={50000}
 *   onInitiate={(reason, evidence) => handleDispute(reason, evidence)}
 * />
 * ```
 */

type DisputeStatus = 'not_started' | 'submitting' | 'submitted' | 'reviewing' | 'resolved' | 'canceled';
type DisputeReason = 'quality_issue' | 'wrong_item' | 'non_delivery' | 'damaged' | 'other';

interface DisputePayload {
  reason: DisputeReason;
  description: string;
  evidenceUrls: string[];
}

interface DisputeResolutionProps {
  orderId: string;
  escrowId: string;
  amount: number;
  currency?: string;
  sellerName?: string;
  buyerName?: string;
  onInitiate?: (payload: DisputePayload) => Promise<void>;
  onCancel?: () => void;
}

interface DisputeEvidenceFile {
  id: string;
  uri: string;
  type: 'photo' | 'video' | 'document';
  uploadedAt: string;
}

const DISPUTE_REASONS: { id: DisputeReason; label: string; description: string }[] = [
  {
    id: 'quality_issue',
    label: 'Quality Issue',
    description: 'Fabric damaged, stitching poor, or quality below standard',
  },
  {
    id: 'wrong_item',
    label: 'Wrong Item',
    description: 'Received item different from order',
  },
  {
    id: 'non_delivery',
    label: 'Non-Delivery',
    description: 'Item not received within promised timeframe',
  },
  {
    id: 'damaged',
    label: 'Damaged on Arrival',
    description: 'Item received in damaged condition',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Other reason not listed above',
  },
];

export const DisputeResolution: React.FC<DisputeResolutionProps> = ({
  orderId,
  escrowId,
  amount,
  currency = 'USD',
  sellerName = 'Seller',
  buyerName = 'You',
  onInitiate,
  onCancel,
}) => {
  const [status, setStatus] = useState<DisputeStatus>('not_started');
  const [selectedReason, setSelectedReason] = useState<DisputeReason | null>(null);
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<DisputeEvidenceFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = selectedReason && description.trim().length > 20 && evidence.length > 0;

  const handleAddEvidence = () => {
    // In a real app, this would open image picker
    const newEvidence: DisputeEvidenceFile = {
      id: `evidence_${Date.now()}`,
      uri: 'file:///mock-evidence.jpg',
      type: 'photo',
      uploadedAt: new Date().toISOString(),
    };
    setEvidence([...evidence, newEvidence]);
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidence(evidence.filter((e) => e.id !== id));
  };

  const handleSubmitDispute = async () => {
    if (!selectedReason) {
      Alert.alert('Missing Information', 'Please select a dispute reason');
      return;
    }

    if (description.trim().length < 20) {
      Alert.alert('Description Too Short', 'Please provide at least 20 characters');
      return;
    }

    if (evidence.length === 0) {
      Alert.alert('Evidence Required', 'Please upload at least one photo or document');
      return;
    }

    setIsSubmitting(true);
    setStatus('submitting');

    try {
      const payload: DisputePayload = {
        reason: selectedReason,
        description: description.trim(),
        evidenceUrls: evidence.map((e) => e.uri),
      };

      if (onInitiate) {
        await onInitiate(payload);
      }

      setStatus('submitted');
      Alert.alert(
        'Dispute Submitted',
        'Your dispute has been submitted. We will review and provide resolution within 5 business days.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit dispute. Please try again.');
      setStatus('not_started');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'submitted' || status === 'reviewing' || status === 'resolved') {
    return <DisputeStatusView status={status} orderId={orderId} amount={amount} currency={currency} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dispute Order</Text>
        <Text style={styles.subtitle}>
          Initiate a formal dispute to recover funds from escrow
        </Text>
      </View>

      {/* Warning */}
      <View style={styles.warning}>
        <Text style={styles.warningTitle}>⚠ Important</Text>
        <View style={styles.warningContent}>
          <Text style={styles.warningPoint}>
            • Disputes require strong evidence (photos, videos, documents)
          </Text>
          <Text style={styles.warningPoint}>
            • Neutral mediator will review and determine fair split
          </Text>
          <Text style={styles.warningPoint}>
            • False disputes may result in account restrictions
          </Text>
          <Text style={styles.warningPoint}>
            • 30-day window to dispute from delivery date
          </Text>
        </View>
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

      {/* Dispute Reason Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dispute Reason</Text>
        {DISPUTE_REASONS.map((reason) => (
          <TouchableOpacity
            key={reason.id}
            style={[
              styles.reasonCard,
              selectedReason === reason.id && styles.reasonCardSelected,
            ]}
            onPress={() => setSelectedReason(reason.id)}
          >
            <View
              style={[
                styles.reasonRadio,
                selectedReason === reason.id && styles.reasonRadioSelected,
              ]}
            />
            <View style={styles.reasonContent}>
              <Text style={styles.reasonLabel}>{reason.label}</Text>
              <Text style={styles.reasonDescription}>{reason.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detailed Explanation</Text>
        <Text style={styles.inputLabel}>
          Provide specific details about the issue (minimum 20 characters)
        </Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Describe what happened, when, and how it affects you..."
          placeholderTextColor={colors.gray400}
          multiline
          numberOfLines={5}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>
          {description.length} characters (minimum 20)
        </Text>
      </View>

      {/* Evidence Upload */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upload Evidence</Text>
        <Text style={styles.inputLabel}>
          Photos, videos, or documents supporting your claim
        </Text>

        {/* Evidence List */}
        {evidence.length > 0 && (
          <View style={styles.evidenceList}>
            {evidence.map((file) => (
              <View key={file.id} style={styles.evidenceItem}>
                <Text style={styles.evidenceIcon}>
                  {file.type === 'photo' ? '📷' : file.type === 'video' ? '🎥' : '📄'}
                </Text>
                <View style={styles.evidenceInfo}>
                  <Text style={styles.evidenceLabel}>
                    {file.type.charAt(0).toUpperCase() + file.type.slice(1)}
                  </Text>
                  <Text style={styles.evidenceDate}>
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveEvidence(file.id)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Add Evidence Button */}
        <TouchableOpacity style={styles.addEvidenceButton} onPress={handleAddEvidence}>
          <Text style={styles.addEvidenceIcon}>+</Text>
          <View style={styles.addEvidenceText}>
            <Text style={styles.addEvidenceLabel}>Add Evidence</Text>
            <Text style={styles.addEvidenceDescription}>
              {evidence.length === 0
                ? 'Upload photo, video, or document'
                : `${evidence.length} file${evidence.length > 1 ? 's' : ''} uploaded`}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Process Info */}
      <View style={styles.processInfo}>
        <Text style={styles.processTitle}>Dispute Process</Text>

        <View style={styles.processStep}>
          <Text style={styles.processStepIcon}>1️⃣</Text>
          <View>
            <Text style={styles.processStepTitle}>Submit Evidence</Text>
            <Text style={styles.processStepDesc}>You've already started this step</Text>
          </View>
        </View>

        <View style={styles.processStep}>
          <Text style={styles.processStepIcon}>2️⃣</Text>
          <View>
            <Text style={styles.processStepTitle}>Seller Response</Text>
            <Text style={styles.processStepDesc}>Seller has 48 hours to respond</Text>
          </View>
        </View>

        <View style={styles.processStep}>
          <Text style={styles.processStepIcon}>3️⃣</Text>
          <View>
            <Text style={styles.processStepTitle}>Neutral Review</Text>
            <Text style={styles.processStepDesc}>Mediator reviews both sides</Text>
          </View>
        </View>

        <View style={styles.processStep}>
          <Text style={styles.processStepIcon}>4️⃣</Text>
          <View>
            <Text style={styles.processStepTitle}>Resolution</Text>
            <Text style={styles.processStepDesc}>Funds split based on findings</Text>
          </View>
        </View>
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
            styles.submitButton,
            (!canSubmit || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitDispute}
          disabled={!canSubmit || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Need help? Contact our support team at{' '}
          <Text style={styles.footerLink}>support@nativpay.com</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

/**
 * DisputeStatusView - Shows dispute status after submission
 */
const DisputeStatusView: React.FC<{
  status: DisputeStatus;
  orderId: string;
  amount: number;
  currency: string;
}> = ({ status, orderId, amount, currency }) => {
  const statusConfig = {
    submitted: {
      icon: '📤',
      title: 'Dispute Submitted',
      message: 'Your dispute is awaiting seller response',
      timeframe: '48 hours',
    },
    reviewing: {
      icon: '👀',
      title: 'Under Review',
      message: 'Neutral mediator is reviewing your case',
      timeframe: '3-5 days',
    },
    resolved: {
      icon: '✓',
      title: 'Dispute Resolved',
      message: 'Funds have been split and released',
      timeframe: 'Complete',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;

  return (
    <View style={styles.statusContainer}>
      <View style={styles.statusContent}>
        <Text style={styles.statusIcon}>{config.icon}</Text>
        <Text style={styles.statusTitle}>{config.title}</Text>
        <Text style={styles.statusMessage}>{config.message}</Text>

        <View style={styles.statusInfo}>
          <View style={styles.statusInfoItem}>
            <Text style={styles.statusLabel}>Order ID</Text>
            <Text style={styles.statusValue}>{orderId.slice(0, 8)}</Text>
          </View>
          <View style={styles.statusInfoItem}>
            <Text style={styles.statusLabel}>Escrow Amount</Text>
            <Text style={styles.statusValue}>
              {currency} {amount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statusInfoItem}>
            <Text style={styles.statusLabel}>Timeframe</Text>
            <Text style={styles.statusValue}>{config.timeframe}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.trackButton}>
          <Text style={styles.trackButtonText}>Track Dispute Status</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    marginBottom: spacing.lg,
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
    marginBottom: spacing.sm,
  },
  warningContent: {
    gap: spacing.sm,
  },
  warningPoint: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
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
    color: colors.error,
    fontWeight: typography.fontWeight.bold,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  reasonCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  reasonCardSelected: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight + '20',
  },
  reasonRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray300,
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  reasonRadioSelected: {
    borderColor: colors.error,
    backgroundColor: colors.error,
  },
  reasonContent: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reasonDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  descriptionInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.gray200,
    minHeight: 120,
  },
  characterCount: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  evidenceList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  evidenceIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  evidenceInfo: {
    flex: 1,
  },
  evidenceLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  evidenceDate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
  },
  removeButton: {
    fontSize: typography.fontSize.lg,
    color: colors.error,
    fontWeight: typography.fontWeight.bold,
  },
  addEvidenceButton: {
    backgroundColor: colors.primaryLight + '20',
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addEvidenceIcon: {
    fontSize: 32,
    color: colors.primary,
    marginRight: spacing.md,
  },
  addEvidenceText: {
    flex: 1,
  },
  addEvidenceLabel: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  addEvidenceDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
  },
  processInfo: {
    backgroundColor: colors.infoBg,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  processTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  processStepIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  processStepTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  processStepDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
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
  submitButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  footer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray700,
  },
  footerLink: {
    color: colors.error,
    fontWeight: typography.fontWeight.semibold,
  },
  // Status View Styles
  statusContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statusContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  statusIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  statusTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statusMessage: {
    fontSize: typography.fontSize.base,
    color: colors.gray600,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  statusInfo: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statusInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
  },
  statusValue: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  trackButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  trackButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
});
