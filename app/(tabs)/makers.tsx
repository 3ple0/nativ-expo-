"use client";

import { View, Text, ScrollView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { theme } from '@/constants/theme';

interface MakerListItem {
  id: string;
  name: string;
  specialization?: string | null;
  rating?: number | null;
}

/**
 * MAKERS TAB SCREEN
 *
 * Browse available tailors and makers.
 * Lists makers with:
 * - Name and rating
 * - Specialization
 * - Response time
 * - Quick link to profile
 */
export default function MakersScreen() {
  const router = useRouter();
  const [makers, setMakers] = useState<MakerListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMakers();
  }, []);

  const loadMakers = async () => {
    try {
      setLoading(true);
      // TODO: Implement getMakersAPI call
      // const data = await getMakersAPI.list();
      // setMakers(data);
    } catch (error) {
      console.error('Error loading makers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <View style={{ padding: 16 }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: theme.colors.neutral[900],
          marginBottom: 4,
        }}>
          Makers
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.colors.neutral[600],
          marginBottom: 16,
        }}>
          Find and book tailors
        </Text>

        <FlatList
          scrollEnabled={false}
          data={makers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/makers/${item.id}`)}
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: theme.colors.neutral[900],
                  }}>
                    {item.name}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.neutral[600],
                    marginTop: 4,
                  }}>
                    {item.specialization || 'General Tailoring'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: theme.colors.primary[600],
                  }}>
                    ⭐ {item.rating?.toFixed(1) || 'N/A'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
  );
}
