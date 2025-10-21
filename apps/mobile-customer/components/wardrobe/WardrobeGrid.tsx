import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, Image } from 'react-native';
import { tokens } from '../../theme/tokens';
import { WardrobeItem } from '../../types';

interface WardrobeGridProps {
  items: WardrobeItem[];
  onItemPress: (item: WardrobeItem) => void;
  onAddPress: () => void;
  isLoading?: boolean;
}

export const WardrobeGrid = ({
  items,
  onItemPress,
  onAddPress,
  isLoading = false,
}: WardrobeGridProps) => {
  const renderItem = (item: WardrobeItem) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => onItemPress(item)}
      style={{
        flex: 1,
        aspectRatio: 1,
        marginHorizontal: tokens.spacing.sm,
        marginBottom: tokens.spacing.md,
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: tokens.borderRadius.lg,
          overflow: 'hidden',
          backgroundColor: tokens.colors.surface,
          borderWidth: 1,
          borderColor: tokens.colors.border,
        }}
      >
        {item.photos && item.photos[0] && (
          <Image
            source={{ uri: item.photos[0] }}
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
            }}
            resizeMode="cover"
          />
        )}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: tokens.spacing.sm,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.sizes.sm,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.surface,
              numberOfLines: 2,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.sizes.xs,
              color: tokens.colors.text.tertiary,
            }}
          >
            {item.fabricType}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: tokens.colors.background,
      }}
      scrollEnabled={true}
    >
      <View
        style={{
          paddingHorizontal: tokens.spacing.lg,
          paddingVertical: tokens.spacing.lg,
        }}
      >
        {/* Add New Item Button */}
        <TouchableOpacity
          onPress={onAddPress}
          style={{
            height: 120,
            borderRadius: tokens.borderRadius.lg,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: tokens.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: tokens.spacing.lg,
            backgroundColor: tokens.colors.primary + '10',
          }}
        >
          <Text
            style={{
              fontSize: 32,
              marginBottom: tokens.spacing.sm,
            }}
          >
            +
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.primary,
            }}
          >
            Add Item
          </Text>
        </TouchableOpacity>

        {/* Grid */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {items.map((item) => (
            <View
              key={item.id}
              style={{
                width: '48%',
                marginBottom: tokens.spacing.md,
              }}
            >
              {renderItem(item)}
            </View>
          ))}
        </View>

        {items.length === 0 && !isLoading && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: tokens.spacing.xl,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.sizes.lg,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.text.secondary,
                marginBottom: tokens.spacing.md,
              }}
            >
              No wardrobe items yet
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.sizes.sm,
                color: tokens.colors.text.tertiary,
                textAlign: 'center',
              }}
            >
              Add your first item to get started with smart wardrobe tracking
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
