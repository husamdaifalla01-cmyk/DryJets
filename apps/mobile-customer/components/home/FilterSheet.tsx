import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Switch } from 'react-native';
import { tokens } from '../../theme/tokens';

export interface FilterOptions {
  distance: number; // miles
  rating: number;
  serviceType: string[];
  priceRange: 'budget' | 'standard' | 'premium' | 'all';
  deliveryTime: string;
  ecoFriendly: boolean;
  sameDayService: boolean;
}

interface FilterSheetProps {
  currentFilters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApply: () => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const DISTANCE_OPTIONS = [1, 5, 10, 20];
const RATING_OPTIONS = [3, 3.5, 4, 4.5];
const SERVICE_TYPES = [
  'Dry Cleaning',
  'Laundromat',
  'Alterations',
  'Shoe Repair',
];
const DELIVERY_TIMES = ['ASAP', 'Next Day', 'This Week'];

export const FilterSheet = ({
  currentFilters,
  onFiltersChange,
  onApply,
  onReset,
  isOpen,
  onClose,
}: FilterSheetProps) => {
  const [filters, setFilters] = useState(currentFilters);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const toggleServiceType = (type: string) => {
    const updated = filters.serviceType.includes(type)
      ? filters.serviceType.filter((t) => t !== type)
      : [...filters.serviceType, type];
    updateFilter('serviceType', updated);
  };

  if (!isOpen) return null;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: tokens.colors.background,
        borderTopLeftRadius: tokens.borderRadius.xl,
        borderTopRightRadius: tokens.borderRadius.xl,
        paddingHorizontal: tokens.spacing.lg,
        paddingTop: tokens.spacing.lg,
        paddingBottom: tokens.spacing.xl,
        maxHeight: '80%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: tokens.spacing.lg,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.sizes.lg,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
            }}
          >
            Filters
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 24 }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Distance */}
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.md,
            }}
          >
            Distance: {filters.distance} mi
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: tokens.spacing.sm,
              flexWrap: 'wrap',
            }}
          >
            {DISTANCE_OPTIONS.map((distance) => (
              <TouchableOpacity
                key={distance}
                onPress={() => updateFilter('distance', distance)}
                style={{
                  paddingHorizontal: tokens.spacing.md,
                  paddingVertical: tokens.spacing.sm,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor:
                    filters.distance === distance
                      ? tokens.colors.primary
                      : tokens.colors.surface,
                  borderWidth: 1,
                  borderColor:
                    filters.distance === distance
                      ? tokens.colors.primary
                      : tokens.colors.border,
                }}
              >
                <Text
                  style={{
                    fontWeight:
                      filters.distance === distance
                        ? tokens.typography.weights.semibold
                        : tokens.typography.weights.regular,
                    color:
                      filters.distance === distance
                        ? tokens.colors.surface
                        : tokens.colors.text.primary,
                  }}
                >
                  {distance}mi
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rating */}
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.md,
            }}
          >
            Minimum Rating: {filters.rating}+
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: tokens.spacing.sm,
              flexWrap: 'wrap',
            }}
          >
            {RATING_OPTIONS.map((rating) => (
              <TouchableOpacity
                key={rating}
                onPress={() => updateFilter('rating', rating)}
                style={{
                  paddingHorizontal: tokens.spacing.md,
                  paddingVertical: tokens.spacing.sm,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor:
                    filters.rating === rating
                      ? tokens.colors.primary
                      : tokens.colors.surface,
                  borderWidth: 1,
                  borderColor:
                    filters.rating === rating
                      ? tokens.colors.primary
                      : tokens.colors.border,
                }}
              >
                <Text
                  style={{
                    fontWeight:
                      filters.rating === rating
                        ? tokens.typography.weights.semibold
                        : tokens.typography.weights.regular,
                    color:
                      filters.rating === rating
                        ? tokens.colors.surface
                        : tokens.colors.text.primary,
                  }}
                >
                  ⭐ {rating}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Service Types */}
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.md,
            }}
          >
            Service Type
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: tokens.spacing.sm,
              flexWrap: 'wrap',
            }}
          >
            {SERVICE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => toggleServiceType(type)}
                style={{
                  paddingHorizontal: tokens.spacing.md,
                  paddingVertical: tokens.spacing.sm,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: filters.serviceType.includes(type)
                    ? tokens.colors.primary
                    : tokens.colors.surface,
                  borderWidth: 1,
                  borderColor: filters.serviceType.includes(type)
                    ? tokens.colors.primary
                    : tokens.colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.sm,
                    fontWeight: filters.serviceType.includes(type)
                      ? tokens.typography.weights.semibold
                      : tokens.typography.weights.regular,
                    color: filters.serviceType.includes(type)
                      ? tokens.colors.surface
                      : tokens.colors.text.primary,
                  }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Range */}
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.md,
            }}
          >
            Price Range
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: tokens.spacing.sm,
              flexWrap: 'wrap',
            }}
          >
            {['budget', 'standard', 'premium', 'all'].map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => updateFilter('priceRange', range)}
                style={{
                  paddingHorizontal: tokens.spacing.md,
                  paddingVertical: tokens.spacing.sm,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor:
                    filters.priceRange === range
                      ? tokens.colors.primary
                      : tokens.colors.surface,
                  borderWidth: 1,
                  borderColor:
                    filters.priceRange === range
                      ? tokens.colors.primary
                      : tokens.colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.sm,
                    fontWeight:
                      filters.priceRange === range
                        ? tokens.typography.weights.semibold
                        : tokens.typography.weights.regular,
                    color:
                      filters.priceRange === range
                        ? tokens.colors.surface
                        : tokens.colors.text.primary,
                    textTransform: 'capitalize',
                  }}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Toggles */}
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: tokens.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: tokens.colors.border,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.sizes.md,
                color: tokens.colors.text.primary,
              }}
            >
              Eco-Friendly Only
            </Text>
            <Switch
              value={filters.ecoFriendly}
              onValueChange={(value) =>
                updateFilter('ecoFriendly', value)
              }
              trackColor={{
                false: tokens.colors.border,
                true: tokens.colors.primary + '50',
              }}
              thumbColor={
                filters.ecoFriendly
                  ? tokens.colors.primary
                  : tokens.colors.border
              }
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: tokens.spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.sizes.md,
                color: tokens.colors.text.primary,
              }}
            >
              Same-Day Service
            </Text>
            <Switch
              value={filters.sameDayService}
              onValueChange={(value) =>
                updateFilter('sameDayService', value)
              }
              trackColor={{
                false: tokens.colors.border,
                true: tokens.colors.primary + '50',
              }}
              thumbColor={
                filters.sameDayService
                  ? tokens.colors.primary
                  : tokens.colors.border
              }
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: 'row',
            gap: tokens.spacing.md,
            marginTop: tokens.spacing.lg,
          }}
        >
          <TouchableOpacity
            onPress={onReset}
            style={{
              flex: 1,
              paddingVertical: tokens.spacing.md,
              borderRadius: tokens.borderRadius.md,
              borderWidth: 1,
              borderColor: tokens.colors.border,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.sizes.md,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.text.primary,
              }}
            >
              Reset
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onApply}
            style={{
              flex: 1,
              paddingVertical: tokens.spacing.md,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primary,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.sizes.md,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.surface,
              }}
            >
              Apply
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
