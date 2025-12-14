import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

/**
 * EscrowStatusBadge Component
 *
 * Displays current escrow status with visual indicator.
 * Non-negotiable states:
 * - locked: Funds held, delivery pending
 * - released: Funds paid to seller
 *
 * Usage:
 * ```tsx
 * <EscrowStatusBadge status="locked" />
 * <EscrowStatusBadge status="released" variant="large" />
 * ```
 */

type EscrowStatus = 'created' | 'held' | 'released' | 'refunded' | 'disputed';

interface EscrowStatusBadgeProps {
  status: EscrowStatus;
  variant?: 'small' | 'medium' | 'large';
  showDescription?: boolean;
}

/**
 * Get badge color and description based on escrow status
 */
const getStatusConfig = (status: EscrowStatus) => {
  const configs: Record<EscrowStatus, { color: string; icon: string; description: string }> = {
    created: {
      color: colors.gray400,
      icon: '⏳',
      description: 'Escrow account created, awaiting payment',
    },
    held: {
      color: colors.warning,
      icon: '🔒',
      description: 'Funds locked. Confirm delivery to release payment to seller.',
    },
    released: {
      color: colors.success,
      icon: '✓',
      description: 'Funds released to seller',
    },
    refunded: {
      color: colors.info,
      icon: '↩',
      description: 'Funds refunded to buyer',
    },
    disputed: {
      color: colors.error,
      icon: '⚠',
      description: 'Under dispute, awaiting resolution',
    },
  };
  return configs[status];
};

/**
 * Get label for status
 */
const getStatusLabel = (status: EscrowStatus): string => {
  const labels: Record<EscrowStatus, string> = {
    created: 'Created',
    held: 'Locked',
    released: 'Released',
    refunded: 'Refunded',
    disputed: 'Disputed',
  };
  return labels[status];
};

/**
 * Get variant styles
 */
const getVariantStyles = (
  variant: 'small' | 'medium' | 'large'
): { fontSize: number; paddingVertical: number; paddingHorizontal: number } => {
  const variants = {
    small: { fontSize: typography.fontSize.xs, paddingVertical: 4, paddingHorizontal: 8 },
    medium: { fontSize: typography.fontSize.sm, paddingVertical: 6, paddingHorizontal: 12 },
    large: { fontSize: typography.fontSize.base, paddingVertical: 8, paddingHorizontal: 16 },
  };
  return variants[variant];
};

export const EscrowStatusBadge: React.FC<EscrowStatusBadgeProps> = ({
  status,
  variant = 'medium',
  showDescription = false,
}) => {
  const config = getStatusConfig(status);
  const label = getStatusLabel(status);
  const variantStyles = getVariantStyles(variant);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: config.color,
            paddingVertical: variantStyles.paddingVertical,
            paddingHorizontal: variantStyles.paddingHorizontal,
          },
        ]}
      >
        <Text style={[styles.icon, { fontSize: variantStyles.fontSize }]}>
          {config.icon}
        </Text>
        <Text
          style={[
            styles.label,
            { fontSize: variantStyles.fontSize, marginLeft: spacing.xs },
          ]}
        >
          {label}
        </Text>
      </View>

      {showDescription && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{config.description}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: spacing.sm,
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  descriptionContainer: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
    fontStyle: 'italic',
  },
});
