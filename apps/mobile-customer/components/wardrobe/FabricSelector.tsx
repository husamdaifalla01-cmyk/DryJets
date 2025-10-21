import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { tokens } from '../../theme/tokens';

interface FabricSelectorProps {
  selectedFabric: string;
  onSelect: (fabric: string) => void;
}

const FABRIC_TYPES = [
  'Cotton',
  'Polyester',
  'Wool',
  'Silk',
  'Linen',
  'Nylon',
  'Spandex',
  'Rayon',
  'Leather',
  'Suede',
  'Cashmere',
  'Denim',
  'Corduroy',
  'Velvet',
  'Satin',
  'Chiffon',
];

export const FabricSelector = ({
  selectedFabric,
  onSelect,
}: FabricSelectorProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        marginVertical: tokens.spacing.md,
      }}
      contentContainerStyle={{
        paddingHorizontal: tokens.spacing.lg,
        gap: tokens.spacing.sm,
      }}
    >
      {FABRIC_TYPES.map((fabric) => (
        <TouchableOpacity
          key={fabric}
          onPress={() => onSelect(fabric)}
          style={{
            paddingHorizontal: tokens.spacing.lg,
            paddingVertical: tokens.spacing.md,
            borderRadius: tokens.borderRadius.lg,
            backgroundColor:
              selectedFabric === fabric
                ? tokens.colors.primary
                : tokens.colors.surface,
            borderWidth: 1,
            borderColor:
              selectedFabric === fabric
                ? tokens.colors.primary
                : tokens.colors.border,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.sizes.sm,
              fontWeight:
                selectedFabric === fabric
                  ? tokens.typography.weights.semibold
                  : tokens.typography.weights.regular,
              color:
                selectedFabric === fabric
                  ? tokens.colors.surface
                  : tokens.colors.text.primary,
            }}
          >
            {fabric}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
