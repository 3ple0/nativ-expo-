"use client";

import { View, Text, ScrollView, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { theme } from '@/constants/theme';

interface FabricListItem {
  id: string;
  name: string;
  color?: string | null;
  imageUrl?: string | null;
  pricePerMeter?: number | null;
}

/**
 * FABRICS TAB SCREEN
 *
 * Browse available fabrics for events.
 * Lists fabrics with:
 * - Thumbnail images
 * - Price per meter
 * - Availability status
 * - Quick add to cart
 */
export default function FabricsScreen() {
  const router = useRouter();
  const [fabrics, setFabrics] = useState<FabricListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFabrics();
  }, []);

  const loadFabrics = async () => {
    try {
      setLoading(true);
      // TODO: Implement getFabricsAPI call
      // const data = await getFabricsAPI.list();
      // setFabrics(data);
    } catch (error) {
      console.error('Error loading fabrics:', error);
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
          Fabrics
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.colors.neutral[600],
          marginBottom: 16,
        }}>
          Browse fabrics for your events
        </Text>

        <FlatList
          scrollEnabled={false}
          data={fabrics}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/fabrics/${item.id}`)}
              style={{
                flex: 1,
                backgroundColor: theme.colors.white,
                borderRadius: 12,
                overflow: 'hidden',
                elevation: 2,
              }}
            >
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: '100%', height: 150 }}
                />
              )}
              <View style={{ padding: 12 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.neutral[900],
                }}>
                  {item.name}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: theme.colors.neutral[600],
                  marginTop: 4,
                }}>
                  {item.color || 'Assorted'}
                </Text>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: theme.colors.primary[600],
                  marginTop: 8,
                }}>
                  ₦{item.pricePerMeter?.toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
  );
}
