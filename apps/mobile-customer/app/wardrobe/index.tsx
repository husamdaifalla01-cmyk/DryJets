import React, { useState } from 'react';
import { View, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { WardrobeGrid } from '../../components/wardrobe';
import { Loading, EmptyState } from '../../components/ui';
import { wardrobeApi } from '../../lib/api';
import { tokens } from '../../theme/tokens';
import { useAuthStore } from '../../lib/store';

export default function WardrobeScreen() {
  const router = useRouter();
  const { customerId } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch wardrobe items
  const {
    data: wardrobeData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['wardrobe', customerId],
    queryFn: () => wardrobeApi.list(customerId!),
    enabled: !!customerId,
  });

  const wardrobeItems = wardrobeData?.data?.data || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleItemPress = (item: any) => {
    router.push({
      pathname: '/wardrobe/[id]',
      params: { id: item.id },
    });
  };

  const handleAddItem = () => {
    router.push('/wardrobe/add-item');
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: tokens.colors.background,
        }}
      >
        <Loading />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: tokens.colors.background,
        }}
      >
        <EmptyState
          title="Error loading wardrobe"
          description="Unable to load your wardrobe items"
          actionLabel="Retry"
          onAction={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: tokens.colors.background,
      }}
    >
      <WardrobeGrid
        items={wardrobeItems}
        onItemPress={handleItemPress}
        onAddPress={handleAddItem}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}
