import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { tokens } from '../../theme/tokens';

interface RatingSelectorProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
}

export const RatingSelector = ({
  rating,
  onRatingChange,
  size = 'medium',
  interactive = true,
}: RatingSelectorProps) => {
  const sizeMap = {
    small: { fontSize: 24, spacing: 4 },
    medium: { fontSize: 32, spacing: 8 },
    large: { fontSize: 48, spacing: 12 },
  };

  const sizeConfig = sizeMap[size];

  const renderStar = (index: number) => {
    const starRating = index + 1;
    const isFilled = starRating <= Math.floor(rating);
    const isPartial = starRating - rating > 0 && starRating - rating < 1;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => interactive && onRatingChange(starRating)}
        disabled={!interactive}
        style={{
          marginHorizontal: sizeConfig.spacing / 2,
        }}
      >
        <Text
          style={{
            fontSize: sizeConfig.fontSize,
          }}
        >
          {isFilled ? '⭐' : isPartial ? '⭐' : '☆'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {[0, 1, 2, 3, 4].map((index) => renderStar(index))}
    </View>
  );
};
