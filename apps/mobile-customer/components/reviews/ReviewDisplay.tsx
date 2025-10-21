import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { tokens } from '../../theme/tokens';
import { RatingSelector } from './RatingSelector';
import { Review } from '../../types';

interface ReviewDisplayProps {
  review: Review;
  onDelete?: () => void;
  onEdit?: () => void;
  canModify?: boolean;
}

export const ReviewDisplay = ({
  review,
  onDelete,
  onEdit,
  canModify = false,
}: ReviewDisplayProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View
      style={{
        borderRadius: tokens.borderRadius.lg,
        borderWidth: 1,
        borderColor: tokens.colors.border,
        padding: tokens.spacing.lg,
        backgroundColor: tokens.colors.surface,
        marginBottom: tokens.spacing.md,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: tokens.spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.sm,
              color: tokens.colors.text.secondary,
              marginBottom: tokens.spacing.xs,
            }}
          >
            {formatDate(review.createdAt)}
          </Text>
          <RatingSelector rating={review.rating} onRatingChange={() => {}} size="small" />
        </View>

        {canModify && (
          <View
            style={{
              flexDirection: 'row',
              gap: tokens.spacing.sm,
            }}
          >
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                style={{
                  paddingHorizontal: tokens.spacing.sm,
                  paddingVertical: tokens.spacing.xs,
                }}
              >
                <Text
                  style={{
                    color: tokens.colors.primary,
                    fontWeight: tokens.typography.weights.semibold,
                    fontSize: tokens.typography.sizes.sm,
                  }}
                >
                  Edit
                </Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                style={{
                  paddingHorizontal: tokens.spacing.sm,
                  paddingVertical: tokens.spacing.xs,
                }}
              >
                <Text
                  style={{
                    color: tokens.colors.error,
                    fontWeight: tokens.typography.weights.semibold,
                    fontSize: tokens.typography.sizes.sm,
                  }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Comment */}
      {review.comment && (
        <Text
          style={{
            fontSize: tokens.typography.sizes.sm,
            color: tokens.colors.text.primary,
            lineHeight: tokens.typography.sizes.sm * 1.5,
            marginBottom: tokens.spacing.md,
          }}
        >
          {review.comment}
        </Text>
      )}

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: tokens.spacing.sm,
            marginBottom: tokens.spacing.md,
          }}
        >
          {review.tags.map((tag) => (
            <View
              key={tag}
              style={{
                paddingHorizontal: tokens.spacing.sm,
                paddingVertical: tokens.spacing.xs,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primary + '20',
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  color: tokens.colors.primary,
                  fontWeight: tokens.typography.weights.semibold,
                }}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommendation Badge */}
      {review.wouldRecommend !== undefined && (
        <View
          style={{
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: review.wouldRecommend
              ? tokens.colors.success + '20'
              : tokens.colors.error + '20',
            alignSelf: 'flex-start',
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.sizes.xs,
              color: review.wouldRecommend
                ? tokens.colors.success
                : tokens.colors.error,
              fontWeight: tokens.typography.weights.semibold,
            }}
          >
            {review.wouldRecommend
              ? '✓ Would recommend'
              : '✗ Would not recommend'}
          </Text>
        </View>
      )}
    </View>
  );
};
