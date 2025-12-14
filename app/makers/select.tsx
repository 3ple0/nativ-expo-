"use client";

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { spacing, colors, typography } from '@/src/theme';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Star, MapPin, DollarSign, CheckCircle } from 'lucide-react-native';

/**
 * Maker Selection Screen
 *
 * Participants select a tailor for their ASO-EBI order.
 * Allows filtering by:
 * - Rating
 * - Price range
 * - Location
 *
 * Creates order with:
 * - buyer_id (current user)
 * - maker_id (selected tailor)
 * - fabric_id (from event)
 * - event_id (ASO-EBI event)
 * - escrow_id (payment escrow)
 */

interface MakerFilter {
  searchText: string;
  minRating: number;
  maxPrice: number;
}

interface Maker {
  id: string;
  display_name: string;
  location?: string;
  rating?: number;
  review_count?: number;
  avg_price_per_meter?: number;
}

export default function SelectMakerScreen() {
  const { eventId, fabricId } = useLocalSearchParams<{
    eventId: string;
    fabricId: string;
  }>();

  const makerStore = {
    makers: [] as Maker[],
    fetchMakers: async () => Promise.resolve(),
    isLoading: false,
    error: null as string | null,
  };
  const { makers, fetchMakers, isLoading, error } = makerStore;

  const [filteredMakers, setFilteredMakers] = useState<Maker[]>(makers);
  const [selectedMakerId, setSelectedMakerId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [filters, setFilters] = useState<MakerFilter>({
    searchText: '',
    minRating: 0,
    maxPrice: 1000000,
  });

  // Fetch makers on mount
  useEffect(() => {
    const loadMakers = async () => {
      try {
        await fetchMakers();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load makers';
        Alert.alert('Error', message);
      }
    };
    loadMakers();
  }, []);

  // Filter makers based on criteria
  useEffect(() => {
    let filtered = makers;

    // Search by name or location
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      filtered = filtered.filter((m) =>
        m.display_name?.toLowerCase().includes(search) ||
        m.location?.toLowerCase().includes(search)
      );
    }

    // Filter by rating
    if (filters.minRating > 0) {
      filtered = filtered.filter((m) => (m.rating || 0) >= filters.minRating);
    }

    // Filter by max price (avg_price_per_meter)
    if (filters.maxPrice > 0) {
      filtered = filtered.filter(
        (m) => (m.avg_price_per_meter || 0) <= filters.maxPrice
      );
    }

    setFilteredMakers(filtered);
  }, [makers, filters]);

  const handleSelectMaker = async () => {
    if (!selectedMakerId) {
      Alert.alert('Error', 'Please select a tailor');
      return;
    }

    if (!eventId || !fabricId) {
      Alert.alert('Error', 'Missing event or fabric information');
      return;
    }

    setIsSelecting(true);

    try {
      // TODO: Create order with selected maker
      // await orderStore.createOrder({
      //   event_id: eventId,
      //   fabric_id: fabricId,
      //   maker_id: selectedMakerId,
      //   status: 'created',
      // });

      Alert.alert('Success', 'Tailor selected! Proceeding to payment...', [
        {
          text: 'Continue',
          onPress: () => {
            router.push(`/payments/checkout?eventId=${eventId}&fabricId=${fabricId}&makerId=${selectedMakerId}`);
          },
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to select tailor';
      Alert.alert('Error', message);
    } finally {
      setIsSelecting(false);
    }
  };

  // Loading state
  if (isLoading && makers.length === 0) {
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
          style={[
            typography.body2,
            {
              color: colors.neutral[600],
              marginTop: spacing.md,
            },
          ]}
        >
          Loading tailors...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.neutral[50] }}>
        <View style={{ padding: spacing.lg, paddingTop: spacing.xl }}>
          <View
            style={{
              backgroundColor: colors.error[50],
              borderLeftWidth: 4,
              borderLeftColor: colors.error[500],
              padding: spacing.lg,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <AlertCircle size={48} color={colors.error[500]} />
            <Text
              style={[
                typography.heading3,
                {
                  color: colors.error[700],
                  marginTop: spacing.md,
                  textAlign: 'center',
                },
              ]}
            >
              Failed to Load
            </Text>
            <Text
              style={[
                typography.body2,
                {
                  color: colors.error[600],
                  marginTop: spacing.sm,
                  textAlign: 'center',
                },
              ]}
            >
              {error}
            </Text>
          </View>

          <Button
            title="Try Again"
            onPress={() => router.back()}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </ScrollView>
    );
  }

  // Empty state
  if (filteredMakers.length === 0) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.neutral[50] }}>
        <View style={{ padding: spacing.lg, paddingTop: spacing.xl }}>
          <Text style={[typography.heading3, { color: colors.neutral[900] }]}>
            Select a Tailor
          </Text>
          <Text
            style={[
              typography.body2,
              {
                color: colors.neutral[600],
                marginTop: spacing.md,
                marginBottom: spacing.lg,
              },
            ]}
          >
            No tailors match your filters. Try adjusting your search.
          </Text>

          <Button title="Clear Filters" onPress={() => setFilters({ searchText: '', minRating: 0, maxPrice: 1000000 })} />
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.neutral[50] }}>
      {/* Header */}
      <View style={{ padding: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.neutral[200] }}>
        <Text style={[typography.heading3, { color: colors.neutral[900] }]}>
          Select a Tailor
        </Text>
        <Text
          style={[
            typography.body2,
            {
              color: colors.neutral[600],
              marginTop: spacing.sm,
            },
          ]}
        >
          Choose a tailor for your ASO-EBI
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Search & Filters */}
        <View style={{ padding: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.neutral[200] }}>
          <TextInput
            placeholder="Search by name or location..."
            value={filters.searchText}
            onChangeText={(text) =>
              setFilters((f) => ({ ...f, searchText: text }))
            }
            style={{
              backgroundColor: colors.neutral[100],
              borderRadius: 8,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              fontSize: 14,
              color: colors.neutral[900],
              marginBottom: spacing.lg,
            }}
            placeholderTextColor={colors.neutral[500]}
          />

          {/* Filter Tags */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <TouchableOpacity
              onPress={() =>
                setFilters((f) => ({
                  ...f,
                  minRating: f.minRating === 4 ? 0 : 4,
                }))
              }
              style={{
                backgroundColor:
                  filters.minRating === 4 ? colors.primary[100] : colors.neutral[100],
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: 20,
                borderWidth: filters.minRating === 4 ? 1 : 0,
                borderColor: colors.primary[300],
              }}
            >
              <Text
                style={[
                  typography.body3,
                  {
                    color:
                      filters.minRating === 4
                        ? colors.primary[600]
                        : colors.neutral[600],
                  },
                ]}
              >
                ⭐ 4+ Rating
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: colors.neutral[100],
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: 20,
              }}
            >
              <Text style={[typography.body3, { color: colors.neutral[600] }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Makers List */}
        <FlatList
          scrollEnabled={false}
          data={filteredMakers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
          renderItem={({ item }) => {
            const isSelected = selectedMakerId === item.id;

            return (
              <TouchableOpacity
                onPress={() => setSelectedMakerId(item.id)}
                style={{
                  backgroundColor: isSelected ? colors.primary[50] : colors.white,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.primary[300] : colors.neutral[200],
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <View style={{ padding: spacing.lg }}>
                  {/* Header */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: spacing.md,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          typography.body2Bold,
                          { color: colors.neutral[900] },
                        ]}
                      >
                        {item.display_name}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: spacing.xs,
                        }}
                      >
                        <Star
                          size={14}
                          color={colors.warning[500]}
                          fill={colors.warning[500]}
                        />
                        <Text
                          style={[
                            typography.body3,
                            { color: colors.neutral[600], marginLeft: spacing.xs },
                          ]}
                        >
                          {item.rating?.toFixed(1) || 'N/A'} (
                          {item.review_count || 0} reviews)
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <View
                        style={{
                          backgroundColor: colors.primary[100],
                          borderRadius: 20,
                          padding: spacing.sm,
                        }}
                      >
                        <CheckCircle
                          size={20}
                          color={colors.primary[600]}
                          fill={colors.primary[600]}
                        />
                      </View>
                    )}
                  </View>

                  {/* Details */}
                  <View style={{ gap: spacing.md }}>
                    {/* Location */}
                    {item.location && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <MapPin size={16} color={colors.neutral[500]} />
                        <Text
                          style={[
                            typography.body3,
                            { color: colors.neutral[600], marginLeft: spacing.sm },
                          ]}
                        >
                          {item.location}
                        </Text>
                      </View>
                    )}

                    {/* Price */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <DollarSign size={16} color={colors.success[500]} />
                      <Text
                        style={[
                          typography.body3,
                          { color: colors.neutral[600], marginLeft: spacing.sm },
                        ]}
                      >
                        ₦{(item.avg_price_per_meter || 0).toLocaleString()} avg
                      </Text>
                    </View>
                  </View>

                  {/* Bio */}
                  {item.bio && (
                    <Text
                      style={[
                        typography.body3,
                        { color: colors.neutral[600], marginTop: spacing.md },
                      ]}
                      numberOfLines={2}
                    >
                      {item.bio}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </ScrollView>

      {/* Bottom Action */}
      <View
        style={{
          backgroundColor: colors.white,
          padding: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: colors.neutral[200],
        }}
      >
        <Button
          title={isSelecting ? 'Selecting...' : 'Continue with Selected Tailor'}
          onPress={handleSelectMaker}
          disabled={isSelecting || !selectedMakerId}
          accessibilityLabel="Select tailor"
        />
      </View>
    </View>
  );
}
