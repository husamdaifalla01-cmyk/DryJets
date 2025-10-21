import React, { useState } from 'react';
import { View, ScrollView, SafeAreaView, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loading, EmptyState } from '../../components/ui';
import { wardrobeApi } from '../../lib/api';
import { tokens } from '../../theme/tokens';
import { useAuthStore } from '../../lib/store';

export default function WardrobeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { customerId } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch wardrobe items to find the item
  const { data: wardrobeData, isLoading } = useQuery({
    queryKey: ['wardrobe', customerId],
    queryFn: () => wardrobeApi.list(customerId!),
    enabled: !!customerId,
  });

  const item = wardrobeData?.data?.data?.find((i: any) => i.id === id);

  // Delete wardrobe item mutation
  const deleteItemMutation = useMutation({
    mutationFn: () => wardrobeApi.delete(customerId!, id!),
    onSuccess: () => {
      Alert.alert('Success', 'Item deleted successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to delete item');
    },
  });

  const handleDelete = () => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteItemMutation.mutate(),
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.colors.background }}>
        <Loading />
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.colors.background }}>
        <EmptyState
          title="Item not found"
          description="This wardrobe item could not be loaded"
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
        {/* Item Image */}
        {item.photos && item.photos[0] && (
          <View
            style={{
              marginVertical: tokens.spacing.lg,
              borderRadius: tokens.borderRadius.lg,
              overflow: 'hidden',
              backgroundColor: tokens.colors.surface,
              aspectRatio: 1,
            }}
          >
            <Image
              source={{ uri: item.photos[0] }}
              style={{
                width: '100%',
                height: '100%',
              }}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Item Details */}
        <View
          style={{
            paddingBottom: tokens.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: tokens.colors.border,
            marginBottom: tokens.spacing.lg,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.sizes.xl,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.sm,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              color: tokens.colors.text.secondary,
              marginBottom: tokens.spacing.md,
            }}
          >
            {item.category} • {item.color}
          </Text>

          {/* Details Grid */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: tokens.spacing.md,
            }}
          >
            <View
              style={{
                flex: 1,
                minWidth: 150,
                paddingHorizontal: tokens.spacing.md,
                paddingVertical: tokens.spacing.sm,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primary + '10',
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  color: tokens.colors.text.secondary,
                  marginBottom: tokens.spacing.xs,
                }}
              >
                Fabric
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.md,
                  fontWeight: tokens.typography.weights.semibold,
                  color: tokens.colors.primary,
                }}
              >
                {item.fabricType}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                minWidth: 150,
                paddingHorizontal: tokens.spacing.md,
                paddingVertical: tokens.spacing.sm,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.success + '10',
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  color: tokens.colors.text.secondary,
                  marginBottom: tokens.spacing.xs,
                }}
              >
                Added
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.md,
                  fontWeight: tokens.typography.weights.semibold,
                  color: tokens.colors.success,
                }}
              >
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Care Instructions */}
        {item.careInstructions && (
          <View style={{ marginBottom: tokens.spacing.lg }}>
            <Text
              style={{
                fontSize: tokens.typography.sizes.md,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.text.primary,
                marginBottom: tokens.spacing.sm,
              }}
            >
              Care Instructions
            </Text>
            <View
              style={{
                paddingHorizontal: tokens.spacing.md,
                paddingVertical: tokens.spacing.md,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.surface,
                borderWidth: 1,
                borderColor: tokens.colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.sizes.sm,
                  color: tokens.colors.text.primary,
                  lineHeight: tokens.typography.sizes.sm * 1.5,
                }}
              >
                {item.careInstructions}
              </Text>
            </View>
          </View>
        )}

        {/* Cleaning Frequency */}
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.sm,
            }}
          >
            Cleaning Frequency
          </Text>
          <View
            style={{
              paddingHorizontal: tokens.spacing.md,
              paddingVertical: tokens.spacing.md,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.surface,
              borderWidth: 1,
              borderColor: tokens.colors.border,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.sizes.md,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.text.primary,
                textTransform: 'capitalize',
              }}
            >
              {item.estimatedFrequency}
            </Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={{ marginBottom: tokens.spacing.xl }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.md,
            }}
          >
            Usage Tracking
          </Text>
          <View
            style={{
              paddingHorizontal: tokens.spacing.md,
              paddingVertical: tokens.spacing.md,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.surface,
              borderWidth: 1,
              borderColor: tokens.colors.border,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing.md,
              }}
            >
              <Text style={{ color: tokens.colors.text.secondary }}>
                Times cleaned
              </Text>
              <Text
                style={{
                  fontWeight: tokens.typography.weights.semibold,
                  color: tokens.colors.primary,
                }}
              >
                {item.cleaningCount || 0}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ color: tokens.colors.text.secondary }}>
                Last cleaned
              </Text>
              <Text
                style={{
                  fontWeight: tokens.typography.weights.semibold,
                  color: tokens.colors.primary,
                }}
              >
                {item.lastCleanedDate
                  ? formatDate(item.lastCleanedDate)
                  : 'Never'}
              </Text>
            </View>
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
              Go Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleteItemMutation.isPending}
            style={{
              flex: 1,
              paddingVertical: tokens.spacing.md,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.error,
              alignItems: 'center',
              opacity: deleteItemMutation.isPending ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.sizes.md,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.surface,
              }}
            >
              {deleteItemMutation.isPending ? 'Deleting...' : 'Delete Item'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
