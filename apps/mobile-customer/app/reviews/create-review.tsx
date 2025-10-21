import React, { useState } from 'react';
import { View, SafeAreaView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ReviewForm } from '../../components/reviews';
import { ordersApi } from '../../lib/api';
import { tokens } from '../../theme/tokens';
import { useAuthStore } from '../../lib/store';

export default function CreateReviewScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { customerId } = useAuthStore();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch order details
  const { data: orderData } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getById(orderId!),
    enabled: !!orderId,
  });

  const order = orderData?.data?.data;

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: (reviewData: {
      orderId: string;
      rating: number;
      comment: string;
      wouldRecommend: boolean;
      tags: string[];
    }) => ordersApi.submitReview(reviewData.orderId, {
      rating: reviewData.rating,
      comment: reviewData.comment,
      wouldRecommend: reviewData.wouldRecommend,
      tags: reviewData.tags,
    }),
    onSuccess: () => {
      Alert.alert('Success', 'Review submitted successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to submit review');
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Validation', 'Please select a rating');
      return;
    }

    if (!orderId) {
      Alert.alert('Error', 'Order ID is required');
      return;
    }

    submitReviewMutation.mutate({
      orderId,
      rating,
      comment,
      wouldRecommend,
      tags: selectedTags,
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: tokens.colors.background,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ReviewForm
          rating={rating}
          onRatingChange={setRating}
          comment={comment}
          onCommentChange={setComment}
          wouldRecommend={wouldRecommend}
          onRecommendChange={setWouldRecommend}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          isLoading={submitReviewMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
