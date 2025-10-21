import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList } from 'react-native';
import { tokens } from '../../theme/tokens';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilterPress: () => void;
  recentSearches?: string[];
  onRecentSearchPress?: (search: string) => void;
  onClearRecent?: () => void;
  showRecentSearches?: boolean;
}

export const SearchBar = ({
  placeholder = 'Search merchants...',
  onSearch,
  onFilterPress,
  recentSearches = [],
  onRecentSearchPress,
  onClearRecent,
  showRecentSearches = true,
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  const handleRecentPress = (search: string) => {
    setQuery(search);
    onRecentSearchPress?.(search);
    setIsFocused(false);
  };

  return (
    <View
      style={{
        backgroundColor: tokens.colors.background,
      }}
    >
      {/* Search Input */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: tokens.spacing.lg,
          paddingVertical: tokens.spacing.md,
          gap: tokens.spacing.md,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: tokens.colors.surface,
            borderRadius: tokens.borderRadius.lg,
            paddingHorizontal: tokens.spacing.md,
            borderWidth: isFocused ? 2 : 1,
            borderColor: isFocused
              ? tokens.colors.primary
              : tokens.colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              marginRight: tokens.spacing.sm,
            }}
          >
            🔍
          </Text>
          <TextInput
            placeholder={placeholder}
            value={query}
            onChangeText={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholderTextColor={tokens.colors.text.tertiary}
            style={{
              flex: 1,
              paddingVertical: tokens.spacing.md,
              color: tokens.colors.text.primary,
              fontSize: tokens.typography.sizes.sm,
            }}
          />
        </View>

        <TouchableOpacity
          onPress={onFilterPress}
          style={{
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.md,
            backgroundColor: tokens.colors.primary,
            borderRadius: tokens.borderRadius.md,
          }}
        >
          <Text
            style={{
              fontSize: 20,
            }}
          >
            ⚙️
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Searches */}
      {isFocused && showRecentSearches && recentSearches.length > 0 && (
        <View
          style={{
            paddingHorizontal: tokens.spacing.lg,
            paddingBottom: tokens.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: tokens.colors.border,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: tokens.spacing.sm,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.sizes.sm,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.text.secondary,
              }}
            >
              Recent Searches
            </Text>
            {onClearRecent && (
              <TouchableOpacity onPress={onClearRecent}>
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.xs,
                    color: tokens.colors.primary,
                  }}
                >
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: tokens.spacing.sm,
            }}
          >
            {recentSearches.slice(0, 5).map((search) => (
              <TouchableOpacity
                key={search}
                onPress={() => handleRecentPress(search)}
                style={{
                  paddingHorizontal: tokens.spacing.md,
                  paddingVertical: tokens.spacing.sm,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: tokens.colors.primary + '20',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.sm,
                    color: tokens.colors.primary,
                    fontWeight: tokens.typography.weights.medium,
                  }}
                >
                  {search}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};
