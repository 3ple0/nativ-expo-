import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

/**
 * PaymentMethodSelector Component
 *
 * Allows selection between multiple payment methods:
 * 1. Card - Credit/debit card
 * 2. Bank Transfer - Direct bank account
 * 3. Wallet - Funds from integrated wallet
 *
 * Non-negotiable: All methods result in escrow holding funds.
 * No direct payment bypass allowed.
 *
 * Usage:
 * ```tsx
 * <PaymentMethodSelector
 *   amount={50000}
 *   onSelect={(method) => handlePaymentMethod(method)}
 * />
 * ```
 */

export type PaymentMethod = 'card' | 'transfer' | 'wallet';

interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: string;
  processingTime: string;
  processingFee: number;
  isAvailable: boolean;
}

interface PaymentMethodSelectorProps {
  amount: number;
  currency?: string;
  onSelect?: (method: PaymentMethod) => Promise<void>;
  walletBalance?: number;
  hideUnavailable?: boolean;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'card',
    label: 'Credit/Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: '💳',
    processingTime: 'Instant',
    processingFee: 0.029, // 2.9% + fixed fee handled server-side
    isAvailable: true,
  },
  {
    id: 'transfer',
    label: 'Bank Transfer',
    description: 'Direct bank account payment',
    icon: '🏦',
    processingTime: '1-2 business days',
    processingFee: 0,
    isAvailable: true,
  },
  {
    id: 'wallet',
    label: 'Wallet',
    description: 'Use your account wallet balance',
    icon: '💰',
    processingTime: 'Instant',
    processingFee: 0,
    isAvailable: true,
  },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  currency = 'USD',
  onSelect,
  walletBalance = 0,
  hideUnavailable = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const availableMethods = hideUnavailable
    ? PAYMENT_METHODS.filter((m) => m.isAvailable)
    : PAYMENT_METHODS;

  const handleSelectMethod = async (method: PaymentMethod) => {
    setSelectedMethod(method);
    setIsLoading(true);

    try {
      if (onSelect) {
        await onSelect(method);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFee = (method: PaymentMethodOption): number => {
    if (method.processingFee === 0) return 0;
    // Example: 2.9% + $0.30 for cards
    return Math.ceil((amount * method.processingFee + 30) / 100) * 100;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Payment Method</Text>
        <Text style={styles.subtitle}>Select how to fund the escrow</Text>
      </View>

      {/* Amount Summary */}
      <View style={styles.amountSummary}>
        <Text style={styles.amountLabel}>Amount to Hold</Text>
        <Text style={styles.amountValue}>
          {currency} {amount.toLocaleString()}
        </Text>
        <Text style={styles.amountNote}>
          Funds held in escrow until delivery confirmed
        </Text>
      </View>

      {/* Payment Methods */}
      <View style={styles.methodsContainer}>
        {availableMethods.map((method) => {
          const fee = calculateFee(method);
          const isSelected = selectedMethod === method.id;
          const canUseWallet = method.id === 'wallet' && walletBalance >= amount;

          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                isSelected && styles.methodCardSelected,
                !method.isAvailable && styles.methodCardDisabled,
              ]}
              onPress={() => method.isAvailable && handleSelectMethod(method.id)}
              disabled={!method.isAvailable}
            >
              {/* Top Row: Icon & Label */}
              <View style={styles.methodHeader}>
                <Text style={styles.methodIcon}>{method.icon}</Text>
                <View style={styles.methodTitleContainer}>
                  <Text style={styles.methodLabel}>{method.label}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                </View>
                <View style={styles.selectIndicator}>
                  <View
                    style={[
                      styles.selectCircle,
                      isSelected && styles.selectCircleSelected,
                    ]}
                  />
                </View>
              </View>

              {/* Details Row */}
              <View style={styles.methodDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Processing</Text>
                  <Text style={styles.detailValue}>{method.processingTime}</Text>
                </View>

                {fee > 0 && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Fee</Text>
                    <Text style={styles.detailValue}>
                      {currency} {(fee / 100).toFixed(2)}
                    </Text>
                  </View>
                )}

                {method.id === 'wallet' && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Balance</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        !canUseWallet && styles.detailValueWarning,
                      ]}
                    >
                      {currency} {walletBalance.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Insufficient Balance Warning */}
              {method.id === 'wallet' && !canUseWallet && (
                <Text style={styles.insufficientWarning}>
                  Insufficient balance. Top up your wallet first.
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How Payment Works</Text>

        <View style={styles.infoStep}>
          <View style={styles.infoStepNumber}>
            <Text style={styles.infoStepNumberText}>1</Text>
          </View>
          <View style={styles.infoStepContent}>
            <Text style={styles.infoStepTitle}>Select Payment Method</Text>
            <Text style={styles.infoStepDescription}>
              Choose card, bank transfer, or wallet
            </Text>
          </View>
        </View>

        <View style={styles.infoStep}>
          <View style={styles.infoStepNumber}>
            <Text style={styles.infoStepNumberText}>2</Text>
          </View>
          <View style={styles.infoStepContent}>
            <Text style={styles.infoStepTitle}>Funds Held in Escrow</Text>
            <Text style={styles.infoStepDescription}>
              Non-negotiable: Amount locked until delivery confirmed
            </Text>
          </View>
        </View>

        <View style={styles.infoStep}>
          <View style={styles.infoStepNumber}>
            <Text style={styles.infoStepNumberText}>3</Text>
          </View>
          <View style={styles.infoStepContent}>
            <Text style={styles.infoStepTitle}>Confirm Delivery</Text>
            <Text style={styles.infoStepDescription}>
              Upload photo proof when item arrives
            </Text>
          </View>
        </View>

        <View style={styles.infoStep}>
          <View style={styles.infoStepNumber}>
            <Text style={styles.infoStepNumberText}>4</Text>
          </View>
          <View style={styles.infoStepContent}>
            <Text style={styles.infoStepTitle}>Release to Seller</Text>
            <Text style={styles.infoStepDescription}>
              Payment released after your confirmation
            </Text>
          </View>
        </View>
      </View>

      {/* Footer Note */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📞 Questions about payment? Contact our support team at{' '}
          <Text style={styles.footerLink}>support@nativpay.com</Text>
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
  amountSummary: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  amountNote: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontStyle: 'italic',
  },
  methodsContainer: {
    marginBottom: spacing.xl,
  },
  methodCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  methodCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  methodCardDisabled: {
    opacity: 0.5,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  methodIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  methodTitleContainer: {
    flex: 1,
  },
  methodLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  methodDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
  },
  selectIndicator: {
    marginLeft: spacing.sm,
  },
  selectCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray300,
  },
  selectCircleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  methodDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  detailValueWarning: {
    color: colors.error,
  },
  insufficientWarning: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: colors.infoBg,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  infoStep: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  infoStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.info,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoStepNumberText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  infoStepContent: {
    flex: 1,
  },
  infoStepTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoStepDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray700,
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
    lineHeight: 20,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});
