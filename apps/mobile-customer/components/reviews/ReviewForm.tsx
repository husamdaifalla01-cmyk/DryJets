import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native';
import { tokens } from '../../theme/tokens';
import { RatingSelector } from './RatingSelector';

interface ReviewFormProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  comment: string;
  onCommentChange: (comment: string) => void;
  wouldRecommend: boolean;
  onRecommendChange: (recommend: boolean) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  isLoading?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const REVIEW_TAGS = [
  'Great Quality',
  'Fast Service',
  'Friendly Staff',
  'Fair Price',
  'Professional',
  'Attention to Detail',
  'Clean Facility',
  'Great Location',
];

export const ReviewForm = ({
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  wouldRecommend,
  onRecommendChange,
  selectedTags,
  onTagsChange,
  isLoading = false,
  onSubmit,
  onCancel,
}: ReviewFormProps) => {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: tokens.colors.background,
        paddingHorizontal: tokens.spacing.lg,
      }}
      scrollEnabled={true}
    >
      {/* Rating Section */}
      <View style={{ marginTop: tokens.spacing.lg, marginBottom: tokens.spacing.lg }}>
        <Text
          style={{
            fontSize: tokens.typography.sizes.lg,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.primary,
            marginBottom: tokens.spacing.md,
            textAlign: 'center',
          }}
        >
          How was your experience?
        </Text>
        <RatingSelector rating={rating} onRatingChange={onRatingChange} size="large" />
        <Text
          style={{
            fontSize: tokens.typography.sizes.sm,
            color: tokens.colors.text.secondary,
            textAlign: 'center',
            marginTop: tokens.spacing.md,
          }}
        >
          {rating === 0
            ? 'Select a rating'
            : rating <= 2
              ? 'Poor experience'
              : rating === 3
                ? 'Average experience'
                : rating === 4
                  ? 'Good experience'
                  : 'Excellent experience'}
        </Text>
      </View>

      {/* Comment Section */}
      <View style={{ marginBottom: tokens.spacing.lg }}>
        <Text
          style={{
            fontSize: tokens.typography.sizes.md,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.primary,
            marginBottom: tokens.spacing.sm,
          }}
        >
          Share details (optional)
        </Text>
        <TextInput
          placeholder="Tell us about your experience..."
          value={comment}
          onChangeText={onCommentChange}
          placeholderTextColor={tokens.colors.text.tertiary}
          multiline
          numberOfLines={4}
          style={{
            borderWidth: 1,
            borderColor: tokens.colors.border,
            borderRadius: tokens.borderRadius.md,
            padding: tokens.spacing.md,
            backgroundColor: tokens.colors.surface,
            color: tokens.colors.text.primary,
            fontSize: tokens.typography.sizes.sm,
            minHeight: 100,
            textAlignVertical: 'top',
          }}
        />
        <Text
          style={{
            fontSize: tokens.typography.sizes.xs,
            color: tokens.colors.text.tertiary,
            marginTop: tokens.spacing.xs,
          }}
        >
          {comment.length}/500 characters
        </Text>
      </View>

      {/* Tags Section */}
      <View style={{ marginBottom: tokens.spacing.lg }}>
        <Text
          style={{
            fontSize: tokens.typography.sizes.md,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.primary,
            marginBottom: tokens.spacing.sm,
          }}
        >
          What stood out?
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: tokens.spacing.sm,
          }}
        >
          {REVIEW_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => toggleTag(tag)}
              style={{
                paddingHorizontal: tokens.spacing.md,
                paddingVertical: tokens.spacing.sm,
                borderRadius: tokens.borderRadius.lg,
                backgroundColor: selectedTags.includes(tag)
                  ? tokens.colors.primary
                  : tokens.colors.surface,
                borderWidth: 1,
                borderColor: selectedTags.includes(tag)
                  ? tokens.colors.primary
                  : tokens.colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.sizes.sm,
                  fontWeight: selectedTags.includes(tag)
                    ? tokens.typography.weights.semibold
                    : tokens.typography.weights.regular,
                  color: selectedTags.includes(tag)
                    ? tokens.colors.surface
                    : tokens.colors.text.primary,
                }}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recommendation Section */}
      <View style={{ marginBottom: tokens.spacing.lg }}>
        <Text
          style={{
            fontSize: tokens.typography.sizes.md,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.primary,
            marginBottom: tokens.spacing.sm,
          }}
        >
          Would you recommend this merchant?
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: tokens.spacing.md,
          }}
        >
          {[true, false].map((recommend) => (
            <TouchableOpacity
              key={recommend ? 'yes' : 'no'}
              onPress={() => onRecommendChange(recommend)}
              style={{
                flex: 1,
                paddingVertical: tokens.spacing.md,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: wouldRecommend === recommend
                  ? recommend
                    ? tokens.colors.success
                    : tokens.colors.error
                  : tokens.colors.surface,
                borderWidth: 1,
                borderColor: wouldRecommend === recommend
                  ? 'transparent'
                  : tokens.colors.border,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.sizes.md,
                  fontWeight: tokens.typography.weights.semibold,
                  color: wouldRecommend === recommend
                    ? tokens.colors.surface
                    : tokens.colors.text.primary,
                }}
              >
                {recommend ? 'Yes ✓' : 'No ✗'}
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
          onPress={onCancel}
          disabled={isLoading}
          style={{
            flex: 1,
            paddingVertical: tokens.spacing.md,
            borderRadius: tokens.borderRadius.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            alignItems: 'center',
            opacity: isLoading ? 0.5 : 1,
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
          onPress={onSubmit}
          disabled={isLoading || rating === 0}
          style={{
            flex: 1,
            paddingVertical: tokens.spacing.md,
            borderRadius: tokens.borderRadius.md,
            backgroundColor:
              rating === 0 ? tokens.colors.border : tokens.colors.primary,
            alignItems: 'center',
            opacity: isLoading || rating === 0 ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.surface,
            }}
          >
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
