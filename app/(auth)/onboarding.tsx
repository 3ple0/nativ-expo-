"use client";

import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { ChevronRight } from 'lucide-react-native';

/**
 * ONBOARDING SCREEN
 *
 * Intro to Nativ and ASO-EBI marketplace.
 * Highlights key features:
 * - Fabric discovery
 * - Tailor coordination
 * - Escrow safety
 * - Event management
 */
export default function OnboardingScreen() {
  const router = useRouter();

  const slides = [
    {
      title: 'Welcome to Nativ',
      description: 'Discover and coordinate ASO-EBI fabrics with trusted tailors',
      icon: '👗',
    },
    {
      title: 'Safe Payments',
      description: 'Your payment is held in escrow until delivery is confirmed',
      icon: '🔐',
    },
    {
      title: 'Trusted Makers',
      description: 'Browse vetted tailors and see their portfolios',
      icon: '👥',
    },
    {
      title: 'Event Coordination',
      description: 'Manage your ASO-EBI event and invite guests',
      icon: '📅',
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.white }}>
      <View style={{ padding: 20, marginTop: 40 }}>
        {slides.map((slide, index) => (
          <View
            key={index}
            style={{
              marginBottom: 48,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 12 }}>
              {slide.icon}
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: theme.colors.neutral[900],
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {slide.title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.neutral[600],
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              {slide.description}
            </Text>
          </View>
        ))}

        {/* CTA */}
        <TouchableOpacity
          onPress={() => router.push('/auth-choice')}
          style={{
            backgroundColor: theme.colors.primary[600],
            borderRadius: 8,
            paddingVertical: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            marginTop: 20,
            marginBottom: 32,
          }}
        >
          <Text
            style={{
              color: theme.colors.white,
              fontSize: 16,
              fontWeight: '700',
            }}
          >
            Get Started
          </Text>
          <ChevronRight color={theme.colors.white} size={20} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
