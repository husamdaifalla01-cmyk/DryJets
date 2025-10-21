import React, { useState } from 'react';
import { View, SafeAreaView, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ReviewDisplay } from '../../components/reviews';
import { Loading, EmptyState } from '../../components/ui';
import { ordersApi } from '../../lib/api';
import { tokens } from '../../theme/tokens';
import { useAuthStore } from '../../lib/store';

export default function ReviewDetailScreen() {
  const router = useRouter();
  const { reviewId } = useLocalSearchParams<{ reviewId: string }>();
  const { customerId } = useAuthStore();

  // Fetch review details
  const { data: reviewData, isLoading } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => ordersApi.getReview(reviewId!),
    enabled: !!reviewId,
  });

  const review = reviewData?.data?.data;

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: () => ordersApi.deleteReview(reviewId!),
    onSuccess: () => {
      Alert.alert('Success', 'Review deleted successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to delete review');
    },
  });

  const handleDelete = () => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteReviewMutation.mutate(),
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

  if (!review) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.colors.background }}>
        <EmptyState
          title="Review not found"
          description="This review could not be loaded"
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const canModify = review.customerId === customerId;

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
        {/* Merchant Info Header */}
        <View
          style={{
            marginVertical: tokens.spacing.lg,
            paddingBottom: tokens.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: tokens.colors.border,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.sizes.lg,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
            }}
          >
            Review for {review.merchant?.businessName || 'Merchant'}
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.sizes.sm,
              color: tokens.colors.text.secondary,
              marginTop: tokens.spacing.xs,
            }}
          >
            Order #{review.orderId?.substring(0, 8)}
          </Text>
        </View>

        {/* Review Display */}
        <View
          style={{
            marginVertical: tokens.spacing.lg,
          }}
        >
          <ReviewDisplay
            review={review}
            canModify={canModify}
            onEdit={() => {
              // Navigate to edit screen if needed
              Alert.alert('Edit', 'Edit review functionality coming soon');
            }}
            onDelete={handleDelete}
          />
        </View>

        {/* Merchant Response Section */}
        {review.merchantResponse && (
          <View
            style={{
              borderRadius: tokens.borderRadius.lg,
              borderWidth: 1,
              borderColor: tokens.colors.success,
              padding: tokens.spacing.lg,
              backgroundColor: tokens.colors.success + '10',
              marginBottom: tokens.spacing.lg,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.sizes.md,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.success,
                marginBottom: tokens.spacing.sm,
              }}
            >
              Merchant Response
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.sizes.sm,
                color: tokens.colors.text.primary,
                lineHeight: tokens.typography.sizes.sm * 1.5,
              }}
            >
              {review.merchantResponse}
            </Text>
            {review.merchantResponseDate && (
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  color: tokens.colors.text.secondary,
                  marginTop: tokens.spacing.md,
                }}
              >
                {new Date(review.merchantResponseDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        {canModify && (
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
              disabled={deleteReviewMutation.isPending}
              style={{
                flex: 1,
                paddingVertical: tokens.spacing.md,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.error,
                alignItems: 'center',
                opacity: deleteReviewMutation.isPending ? 0.5 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.sizes.md,
                  fontWeight: tokens.typography.weights.semibold,
                  color: tokens.colors.surface,
                }}
              >
                {deleteReviewMutation.isPending ? 'Deleting...' : 'Delete Review'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
