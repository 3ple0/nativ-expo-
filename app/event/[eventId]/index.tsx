import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useParticipantStore } from '@/src/store/participant.store';
import { spacing, colors } from '@/src/theme';
import { Button } from '@/components/ui/Button';
import { ChevronRight, Users, DollarSign, Zap, TrendingUp } from 'lucide-react-native';

/**
 * Event Guest Dashboard (U1)
 * 
 * After guest joins event, they:
 * 1. View event details & assigned fabric
 * 2. Select a tailor
 * 3. Make payment (escrow)
 * 4. Track production
 */

// Mock event data
const mockEvent = {
  id: '1',
  title: 'AsoEbi Event 2024',
  description: 'Traditional fabric tailoring for the wedding',
  price_per_person: 85000,
  status: 'live',
  fabric: {
    name: 'Ankara Print',
    color: 'Royal Blue',
  },
};

export default function EventGuestDashboard() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { confirmParticipant } = useParticipantStore();
  const [isLoading, setIsLoading] = useState(false);

  const activeEvent = mockEvent;
  const isEventLoading = isLoading;
  const error = null;

  if (isEventLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.neutral[50],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text
          style={{
            color: colors.neutral[600],
            marginTop: spacing.md,
            fontSize: 16,
            lineHeight: 24,
          }}
        >
          Loading event...
        </Text>
      </View>
    );
  }

  if (!activeEvent) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.neutral[50] }}>
        <View style={{ padding: spacing.lg, paddingTop: spacing.xl }}>
          <Text
            style={{
              color: colors.error[600],
              fontSize: 28,
              fontWeight: '700',
              lineHeight: 36,
            }}
          >
            Event Not Found
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.neutral[50] }}>
      <View style={{ padding: spacing.lg }}>
        {/* Event Header */}
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: colors.neutral[200],
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              lineHeight: 36,
              color: colors.neutral[900],
            }}
          >
            {activeEvent.title}
          </Text>
          {activeEvent.description && (
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                color: colors.neutral[600],
                marginTop: spacing.md,
              }}
            >
              {activeEvent.description}
            </Text>
          )}

          {/* Quick Stats */}
          <View
            style={{
              marginTop: spacing.lg,
              paddingTop: spacing.lg,
              borderTopWidth: 1,
              borderTopColor: colors.neutral[200],
              gap: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: colors.neutral[600],
                }}
              >
                Price per Person
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.primary[600],
                }}
              >
                ₦{activeEvent.price_per_person?.toLocaleString() || 'TBD'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: colors.neutral[600],
                }}
              >
                Event Status
              </Text>
              <View
                style={{
                  backgroundColor:
                    activeEvent.status === 'live' ? colors.success[100] : colors.warning[100],
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    fontWeight: '600',
                    color:
                      activeEvent.status === 'live'
                        ? colors.success[700]
                        : colors.warning[700],
                  }}
                >
                  {activeEvent.status?.toUpperCase() || 'UNKNOWN'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Steps */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            textTransform: 'uppercase',
            color: colors.neutral[900],
            marginBottom: spacing.md,
            letterSpacing: 0.5,
          }}
        >
          Your Next Steps
        </Text>

        {/* Step 1: View Fabric */}
        <TouchableOpacity
          onPress={() => router.push(`/event/${eventId}/fabric`)}
          style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: spacing.lg,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.neutral[200],
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View
              style={{
                backgroundColor: colors.primary[100],
                borderRadius: 8,
                padding: spacing.md,
                marginRight: spacing.md,
              }}
            >
              <TrendingUp size={24} color={colors.primary[600]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.neutral[900],
                }}
              >
                View Fabric
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: colors.neutral[600],
                  marginTop: spacing.xs,
                }}
              >
                See assigned fabric details
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.neutral[400]} />
        </TouchableOpacity>

        {/* Step 2: Choose Tailor */}
        <TouchableOpacity
          onPress={() => router.push(`/event/${eventId}/makers`)}
          style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: spacing.lg,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.neutral[200],
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View
              style={{
                backgroundColor: colors.success[100],
                borderRadius: 8,
                padding: spacing.md,
                marginRight: spacing.md,
              }}
            >
              <Users size={24} color={colors.success[600]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.neutral[900],
                }}
              >
                Choose Tailor
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: colors.neutral[600],
                  marginTop: spacing.xs,
                }}
              >
                Select a skilled maker
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.neutral[400]} />
        </TouchableOpacity>

        {/* Step 3: Payment */}
        <TouchableOpacity
          onPress={() => router.push(`/event/${eventId}/pay`)}
          style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: spacing.lg,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.neutral[200],
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View
              style={{
                backgroundColor: colors.warning[100],
                borderRadius: 8,
                padding: spacing.md,
                marginRight: spacing.md,
              }}
            >
              <DollarSign size={24} color={colors.warning[600]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.neutral[900],
                }}
              >
                Pay Now
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: colors.neutral[600],
                  marginTop: spacing.xs,
                }}
              >
                Secure payment via escrow
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.neutral[400]} />
        </TouchableOpacity>

        {/* Step 4: Track Order */}
        <TouchableOpacity
          onPress={() => router.push(`/orders`)}
          style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: colors.neutral[200],
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View
              style={{
                backgroundColor: colors.neutral[100],
                borderRadius: 8,
                padding: spacing.md,
                marginRight: spacing.md,
              }}
            >
              <Zap size={24} color={colors.neutral[600]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.neutral[900],
                }}
              >
                Track Order
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: colors.neutral[600],
                  marginTop: spacing.xs,
                }}
              >
                Monitor production & delivery
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.neutral[400]} />
        </TouchableOpacity>

        {/* Safety Info */}
        <View
          style={{
            backgroundColor: colors.info[50],
            borderLeftWidth: 4,
            borderLeftColor: colors.info[500],
            padding: spacing.md,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: colors.info[700],
            }}
          >
            💳 <Text style={{ fontWeight: '600' }}>Secure Payment</Text>
          </Text>
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: colors.info[700],
              marginTop: spacing.xs,
            }}
          >
            Your payment is held in escrow until you confirm delivery
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
