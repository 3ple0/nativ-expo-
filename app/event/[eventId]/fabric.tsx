import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEventFabricStore } from '@/src/store/eventFabric.store';
import { spacing, colors } from '@/src/theme';
import { Button } from '@/components/ui/Button';
import { Star, Zap } from 'lucide-react-native';

/**
 * Event Fabric Viewer (U1 - Step 1)
 */

const mockFabric = {
  id: '1',
  fabric_name: 'Premium Ankara',
  price_per_meter: 8500,
  is_primary: true,
};

export default function EventFabricViewer() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { fabrics, fetchEventFabrics, isLoading } = useEventFabricStore();
  const [error, setError] = useState<string | null>(null);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (eventId) {
      fetchEventFabrics(eventId).catch((err: any) => {
        const message = err instanceof Error ? err.message : 'Failed to load fabrics';
        setError(message);
        Alert.alert('Error', message);
      });
    }
  }, [eventId]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.neutral[50], justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={{ fontSize: 16, lineHeight: 24, color: colors.neutral[600], marginTop: spacing.md }}>
          Loading fabrics...
        </Text>
      </View>
    );
  }

  const primaryFabric = fabrics.find((f) => f.is_primary);
  const fabric = primaryFabric || fabrics[0] || mockFabric;

  if (!fabric) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.neutral[50] }}>
        <View style={{ padding: spacing.lg, paddingTop: spacing.xl }}>
          <Button title="← Back" onPress={() => router.back()} />
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.neutral[600], marginTop: spacing.lg, textAlign: 'center' }}>
            No Fabric Assigned
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: colors.neutral[500], marginTop: spacing.md, textAlign: 'center' }}>
            The host hasn't assigned a fabric yet.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.neutral[50] }}>
      {/* Header with Back Button */}
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.md,
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.neutral[200],
        }}
      >
        <Button
          title="← Back"
          onPress={() => router.back()}
          style={{
            backgroundColor: colors.neutral[100],
            paddingHorizontal: spacing.md,
          }}
        />
      </View>

      <View style={{ padding: spacing.lg }}>
        {/* Fabric Image Placeholder */}
        <View
          style={{
            backgroundColor: colors.primary[100],
            height: 300,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.lg,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              backgroundColor: colors.primary[500],
              borderRadius: 50,
              opacity: 0.5,
            }}
          />
        </View>

        {/* Fabric Info */}
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
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: spacing.lg,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.neutral[900] }}>
                {fabric.fabric_name || 'Premium Fabric'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md }}>
                <Star size={16} color={colors.warning[500]} fill={colors.warning[500]} />
                <Text style={{ fontSize: 14, lineHeight: 20, color: colors.neutral[600], marginLeft: spacing.sm }}>
                  Premium Quality
                </Text>
              </View>
            </View>

            {fabric.is_primary && (
              <View
                style={{
                  backgroundColor: colors.success[100],
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: 20,
                }}
              >
                <Text style={{ fontSize: 14, lineHeight: 20, color: colors.success[700], fontWeight: '600' }}>
                  Primary
                </Text>
              </View>
            )}
          </View>

          {/* Pricing */}
          <View
            style={{
              backgroundColor: colors.primary[50],
              padding: spacing.md,
              borderRadius: 8,
              marginBottom: spacing.lg,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', color: colors.primary[700], marginBottom: spacing.sm, letterSpacing: 0.5 }}>
              Host's Pricing
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary[600] }}>
              ₦{fabric.price_per_meter?.toLocaleString() || '8,500'} per meter
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 20, color: colors.primary[600], marginTop: spacing.xs }}>
              Set by event host
            </Text>
          </View>

          {/* Description */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: spacing.sm, letterSpacing: 0.5 }}>
              Description
            </Text>
            <Text style={{ fontSize: 16, lineHeight: 24, color: colors.neutral[600] }}>
              High-quality traditional fabric, perfect for ASO-EBI occasions. Durable and vibrant colors that last.
            </Text>
          </View>

          {/* Care Instructions */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: spacing.sm, letterSpacing: 0.5 }}>
              Care Instructions
            </Text>
            <View style={{ gap: spacing.sm }}>
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.neutral[600] }}>
                • Hand wash in cold water
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.neutral[600] }}>
                • Avoid harsh detergents
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.neutral[600] }}>
                • Iron on medium heat
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.neutral[600] }}>
                • Store in cool, dry place
              </Text>
            </View>
          </View>

          {/* Specifications */}
          <View
            style={{
              paddingTop: spacing.lg,
              borderTopWidth: 1,
              borderTopColor: colors.neutral[200],
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: spacing.md, letterSpacing: 0.5 }}>
              Specifications
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: spacing.sm,
              }}
            >
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.neutral[600] }}>
                Material
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.neutral[900], fontWeight: '600' }}>
                100% Cotton
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: spacing.sm,
              }}
            >
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.neutral[600] }}>
                Width
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.neutral[900], fontWeight: '600' }}>
                58-60 inches
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.neutral[600] }}>
                Weight
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.neutral[900], fontWeight: '600' }}>
                250 gsm
              </Text>
            </View>
          </View>
        </View>

        {/* Info Box */}
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
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Zap size={20} color={colors.info[600]} style={{ marginRight: spacing.md, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.info[700] }}>
                Next Step
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.info[700], marginTop: spacing.xs }}>
                Select your preferred tailor. They will use this fabric to create your ASO-EBI outfit.
              </Text>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <Button
          title="Choose Tailor"
          onPress={() => router.push(`/event/${eventId}/makers`)}
        />
      </View>
    </ScrollView>
  );
}
