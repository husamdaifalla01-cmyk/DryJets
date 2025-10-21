import React, { useState } from 'react';
import { View, ScrollView, SafeAreaView, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { FabricSelector } from '../../components/wardrobe';
import { wardrobeApi } from '../../lib/api';
import { tokens } from '../../theme/tokens';
import { useAuthStore } from '../../lib/store';

const CATEGORIES = [
  'Shirt',
  'Pants',
  'Dress',
  'Skirt',
  'Jacket',
  'Sweater',
  'Underwear',
  'Socks',
  'Shoes',
  'Accessories',
  'Outerwear',
];

export default function AddItemScreen() {
  const router = useRouter();
  const { customerId } = useAuthStore();

  const [name, setName] = useState('');
  const [fabricType, setFabricType] = useState('Cotton');
  const [color, setColor] = useState('');
  const [category, setCategory] = useState('Shirt');
  const [careInstructions, setCareInstructions] = useState('');
  const [estimatedFrequency, setEstimatedFrequency] = useState('monthly');

  // Add wardrobe item mutation
  const addItemMutation = useMutation({
    mutationFn: () =>
      wardrobeApi.create(customerId!, {
        name,
        fabricType,
        color,
        category: category as any,
        careInstructions,
        estimatedFrequency: estimatedFrequency as any,
        photos: [],
      }),
    onSuccess: () => {
      Alert.alert('Success', 'Item added to wardrobe!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to add item');
    },
  });

  const handleAddItem = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter an item name');
      return;
    }

    if (!color.trim()) {
      Alert.alert('Validation', 'Please enter a color');
      return;
    }

    addItemMutation.mutate();
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: tokens.colors.background,
      }}
    >
      <ScrollView
        style={{
          flex: 1,
          paddingHorizontal: tokens.spacing.lg,
        }}
      >
        {/* Item Name */}
        <View style={{ marginVertical: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.sm,
            }}
          >
            Item Name
          </Text>
          <TextInput
            placeholder="e.g., Blue Jeans, White T-Shirt"
            value={name}
            onChangeText={setName}
            placeholderTextColor={tokens.colors.text.tertiary}
            style={{
              borderWidth: 1,
              borderColor: tokens.colors.border,
              borderRadius: tokens.borderRadius.md,
              padding: tokens.spacing.md,
              backgroundColor: tokens.colors.surface,
              color: tokens.colors.text.primary,
              fontSize: tokens.typography.sizes.sm,
            }}
          />
        </View>

        {/* Color */}
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.sm,
            }}
          >
            Color
          </Text>
          <TextInput
            placeholder="e.g., Blue, Navy, Light Blue"
            value={color}
            onChangeText={setColor}
            placeholderTextColor={tokens.colors.text.tertiary}
            style={{
              borderWidth: 1,
              borderColor: tokens.colors.border,
              borderRadius: tokens.borderRadius.md,
              padding: tokens.spacing.md,
              backgroundColor: tokens.colors.surface,
              color: tokens.colors.text.primary,
              fontSize: tokens.typography.sizes.sm,
            }}
          />
        </View>

        {/* Category */}
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.sm,
            }}
          >
            Category
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: tokens.spacing.sm,
            }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={{
                  paddingHorizontal: tokens.spacing.md,
                  paddingVertical: tokens.spacing.sm,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor:
                    category === cat
                      ? tokens.colors.primary
                      : tokens.colors.surface,
                  borderWidth: 1,
                  borderColor:
                    category === cat
                      ? tokens.colors.primary
                      : tokens.colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.sm,
                    fontWeight:
                      category === cat
                        ? tokens.typography.weights.semibold
                        : tokens.typography.weights.regular,
                    color:
                      category === cat
                        ? tokens.colors.surface
                        : tokens.colors.text.primary,
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fabric Type */}
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.sm,
            }}
          >
            Fabric Type
          </Text>
          <FabricSelector
            selectedFabric={fabricType}
            onSelect={setFabricType}
          />
        </View>

        {/* Care Instructions */}
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.sm,
            }}
          >
            Care Instructions (optional)
          </Text>
          <TextInput
            placeholder="e.g., Hand wash, Dry clean only"
            value={careInstructions}
            onChangeText={setCareInstructions}
            placeholderTextColor={tokens.colors.text.tertiary}
            multiline
            numberOfLines={3}
            style={{
              borderWidth: 1,
              borderColor: tokens.colors.border,
              borderRadius: tokens.borderRadius.md,
              padding: tokens.spacing.md,
              backgroundColor: tokens.colors.surface,
              color: tokens.colors.text.primary,
              fontSize: tokens.typography.sizes.sm,
              textAlignVertical: 'top',
            }}
          />
        </View>

        {/* Cleaning Frequency */}
        <View style={{ marginBottom: tokens.spacing.xl }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.sm,
            }}
          >
            How often do you clean this?
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: tokens.spacing.sm,
            }}
          >
            {['weekly', 'biweekly', 'monthly', 'quarterly'].map((freq) => (
              <TouchableOpacity
                key={freq}
                onPress={() => setEstimatedFrequency(freq)}
                style={{
                  paddingHorizontal: tokens.spacing.md,
                  paddingVertical: tokens.spacing.sm,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor:
                    estimatedFrequency === freq
                      ? tokens.colors.primary
                      : tokens.colors.surface,
                  borderWidth: 1,
                  borderColor:
                    estimatedFrequency === freq
                      ? tokens.colors.primary
                      : tokens.colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.sm,
                    fontWeight:
                      estimatedFrequency === freq
                        ? tokens.typography.weights.semibold
                        : tokens.typography.weights.regular,
                    color:
                      estimatedFrequency === freq
                        ? tokens.colors.surface
                        : tokens.colors.text.primary,
                    textTransform: 'capitalize',
                  }}
                >
                  {freq}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: 'row',
            gap: tokens.spacing.md,
            marginBottom: tokens.spacing.xl,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={addItemMutation.isPending}
            style={{
              flex: 1,
              paddingVertical: tokens.spacing.md,
              borderRadius: tokens.borderRadius.md,
              borderWidth: 1,
              borderColor: tokens.colors.border,
              alignItems: 'center',
              opacity: addItemMutation.isPending ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.sizes.md,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.text.primary,
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAddItem}
            disabled={addItemMutation.isPending}
            style={{
              flex: 1,
              paddingVertical: tokens.spacing.md,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primary,
              alignItems: 'center',
              opacity: addItemMutation.isPending ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.sizes.md,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.surface,
              }}
            >
              {addItemMutation.isPending ? 'Adding...' : 'Add Item'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
