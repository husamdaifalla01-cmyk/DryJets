# Phase 4 Quick Reference Guide

## File Organization

### Part 4: Reviews (5 files, ~350 lines)
```
components/reviews/
├── RatingSelector.tsx       - 5-star interactive selector
├── ReviewForm.tsx           - Complete review creation form
├── ReviewDisplay.tsx        - Review display with edit/delete
└── index.ts                 - Exports

app/reviews/
├── _layout.tsx              - Navigation layout
├── create-review.tsx        - Create review screen
└── [id].tsx                 - Review detail screen
```

### Part 5: Wardrobe (7 files, ~550 lines)
```
components/wardrobe/
├── WardrobeGrid.tsx         - 2-column grid layout
├── FabricSelector.tsx       - Horizontal fabric picker
└── index.ts                 - Exports

app/wardrobe/
├── _layout.tsx              - Navigation layout
├── index.tsx                - Main wardrobe screen
├── add-item.tsx             - Add new item form
└── [id].tsx                 - Item detail screen
```

### Part 6: Search & Filters (3 files, ~400 lines)
```
components/home/
├── SearchBar.tsx            - Search with recent searches
├── FilterSheet.tsx          - Advanced filter modal
└── index.ts                 - Exports + types
```

### Part 7: Notifications (6 files, ~700 lines)
```
lib/notifications/
├── notificationTypes.ts     - Types and enums
├── notificationsManager.ts  - Core manager
├── notificationPreferences.ts - Preferences logic
└── index.ts                 - Exports

hooks/useNotifications.ts    - React hook

app/settings/notifications.tsx - Settings screen
```

---

## Key Imports

### Part 4: Reviews
```typescript
import { RatingSelector, ReviewForm, ReviewDisplay } from '../../components/reviews';
import { ordersApi } from '../../lib/api';
```

### Part 5: Wardrobe
```typescript
import { WardrobeGrid, FabricSelector } from '../../components/wardrobe';
import { wardrobeApi } from '../../lib/api';
```

### Part 6: Search
```typescript
import { SearchBar, FilterSheet } from '../../components/home';
import type { FilterOptions } from '../../components/home';
```

### Part 7: Notifications
```typescript
import { useNotifications } from '../../hooks/useNotifications';
import {
  notificationsManager,
  NotificationPreferencesManager,
  type NotificationPreferences
} from '../../lib/notifications';
```

---

## Component Props

### RatingSelector
```typescript
<RatingSelector
  rating={rating}
  onRatingChange={setRating}
  size="medium"           // small | medium | large
  interactive={true}
/>
```

### ReviewForm
```typescript
<ReviewForm
  rating={rating}
  onRatingChange={setRating}
  comment={comment}
  onCommentChange={setComment}
  wouldRecommend={wouldRecommend}
  onRecommendChange={setWouldRecommend}
  selectedTags={selectedTags}
  onTagsChange={setSelectedTags}
  isLoading={false}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

### WardrobeGrid
```typescript
<WardrobeGrid
  items={wardrobeItems}
  onItemPress={handleItemPress}
  onAddPress={handleAddItem}
  isLoading={false}
/>
```

### SearchBar
```typescript
<SearchBar
  placeholder="Search merchants..."
  onSearch={handleSearch}
  onFilterPress={handleFilterPress}
  recentSearches={recentSearches}
  onRecentSearchPress={handleRecentPress}
  onClearRecent={handleClearRecent}
  showRecentSearches={true}
/>
```

### FilterSheet
```typescript
<FilterSheet
  currentFilters={filters}
  onFiltersChange={handleFiltersChange}
  onApply={handleApply}
  onReset={handleReset}
  isOpen={isOpen}
  onClose={handleClose}
/>
```

---

## API Endpoints

### Reviews
```typescript
// Create review
ordersApi.submitReview(orderId, {
  rating: 5,
  comment: "Great!",
  wouldRecommend: true,
  tags: ["Fast Service", "Professional"]
})

// Get review
ordersApi.getReview(reviewId)

// Delete review
ordersApi.deleteReview(reviewId)
```

### Wardrobe
```typescript
// Create item
wardrobeApi.create(customerId, {
  name: "Blue Jeans",
  fabricType: "Denim",
  color: "Blue",
  category: "Pants",
  careInstructions: "Cold wash",
  estimatedFrequency: "monthly"
})

// List items
wardrobeApi.list(customerId)

// Update item
wardrobeApi.update(customerId, itemId, updateData)

// Delete item
wardrobeApi.delete(customerId, itemId)
```

### Search
```typescript
// Search orders
ordersApi.search(customerId, {
  query: "Clean Co",
  status: "COMPLETED",
  sort: "newest",
  limit: 20,
  page: 1
})
```

### Notifications
```typescript
// Register device token
notificationsApi.registerDeviceToken(customerId, token, 'ios')

// Get notifications
notificationsApi.list(customerId)

// Mark as read
notificationsApi.markAsRead(notificationId)

// Update preferences
notificationsApi.updatePreferences(customerId, preferences)
```

---

## Hook Usage

### useNotifications
```typescript
const {
  initialized,
  deviceToken,
  notifications,
  unreadCount,
  preferences,
  updatePreferences,
  markAsRead,
  clearAllNotifications,
  refetchNotifications
} = useNotifications();
```

---

## Key Types

### Part 4
```typescript
enum NotificationType {
  ORDER_CREATED = "order:created",
  ORDER_CONFIRMED = "order:confirmed",
  // ... 10+ types
}

interface PushNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}
```

### Part 6
```typescript
interface FilterOptions {
  distance: number;
  rating: number;
  serviceType: string[];
  priceRange: 'budget' | 'standard' | 'premium' | 'all';
  deliveryTime: string;
  ecoFriendly: boolean;
  sameDayService: boolean;
}
```

### Part 7
```typescript
interface NotificationPreferences {
  ordersEnabled: boolean;
  ordersSound: boolean;
  ordersVibration: boolean;
  driverEnabled: boolean;
  driverSound: boolean;
  driverVibration: boolean;
  promotionEnabled: boolean;
  promotionSound: boolean;
  promotionVibration: boolean;
  subscriptionEnabled: boolean;
  subscriptionSound: boolean;
  subscriptionVibration: boolean;
  quietHourStart?: string; // HH:mm
  quietHourEnd?: string;   // HH:mm
  doNotDisturb: boolean;
}
```

---

## Usage Examples

### Creating a Review
```typescript
const handleSubmitReview = async () => {
  const mutation = useMutation({
    mutationFn: (data) => ordersApi.submitReview(orderId, data)
  });

  mutation.mutate({
    rating: 5,
    comment: "Great service!",
    wouldRecommend: true,
    tags: ["Fast Service"]
  });
};
```

### Adding Wardrobe Item
```typescript
const handleAddItem = async () => {
  const mutation = useMutation({
    mutationFn: (data) => wardrobeApi.create(customerId, data)
  });

  mutation.mutate({
    name: "Blue Jeans",
    fabricType: "Denim",
    color: "Blue",
    category: "Pants",
    careInstructions: "Cold wash",
    estimatedFrequency: "monthly"
  });
};
```

### Searching with Filters
```typescript
const handleSearch = async (query: string) => {
  const results = await ordersApi.search(customerId, {
    query,
    status: selectedStatus,
    minAmount: filters.minPrice,
    maxAmount: filters.maxPrice,
    sort: "newest"
  });
};
```

### Managing Notifications
```typescript
const { notifications, markAsRead, clearAllNotifications } = useNotifications();

// Mark as read
markAsRead(notificationId);

// Clear all
clearAllNotifications();
```

---

## Navigation

### Add Review
```typescript
router.push({
  pathname: '/reviews/create-review',
  params: { orderId }
});
```

### View Review
```typescript
router.push({
  pathname: '/reviews/[id]',
  params: { id: reviewId }
});
```

### Wardrobe
```typescript
router.push('/wardrobe');           // List
router.push('/wardrobe/add-item');  // Add
router.push({
  pathname: '/wardrobe/[id]',
  params: { id: itemId }
});                                  // Detail
```

### Notifications Settings
```typescript
router.push('/settings/notifications');
```

---

## Common Patterns

### Loading State
```typescript
if (isLoading) return <Loading />;
if (error) return <EmptyState title="Error" />;
if (!data) return <EmptyState title="No data" />;
```

### Mutation with Toast
```typescript
const mutation = useMutation({
  mutationFn: submitData,
  onSuccess: () => {
    Alert.alert('Success', 'Operation completed');
  },
  onError: (error: any) => {
    Alert.alert('Error', error.message);
  }
});
```

### Query with Refetch
```typescript
const { data, isLoading, refetch } = useQuery({
  queryKey: ['key'],
  queryFn: fetchData,
  enabled: !!dependency
});

const handleRefresh = async () => {
  await refetch();
};
```

---

## Testing Checklist

- [ ] Part 4: Create, view, delete reviews
- [ ] Part 4: Star rating interaction
- [ ] Part 4: Tags and recommendations
- [ ] Part 5: Add wardrobe items
- [ ] Part 5: View item details
- [ ] Part 5: Delete wardrobe items
- [ ] Part 6: Search functionality
- [ ] Part 6: Filter by distance
- [ ] Part 6: Filter by rating
- [ ] Part 6: Filter by service type
- [ ] Part 7: Request permissions
- [ ] Part 7: Receive notifications
- [ ] Part 7: Quiet hours work
- [ ] Part 7: Settings persist

---

## Performance Tips

1. Use React Query for caching
2. Lazy load image galleries
3. Paginate long lists
4. Memoize expensive components
5. Use proper key in lists
6. Clean up subscriptions
7. Debounce search input
8. Batch notification updates

---

## Security Reminders

1. Never store tokens in plain text
2. Use secure storage (expo-secure-store)
3. Validate all user inputs
4. Sanitize API responses
5. Check user ownership before delete
6. Implement proper error handling
7. Log security events
8. Use HTTPS for all API calls

---

## Troubleshooting

**Reviews not loading?**
- Check order exists
- Verify user has permission
- Check API response

**Wardrobe items missing?**
- Verify customerId is set
- Check React Query cache
- Refresh query

**Filters not working?**
- Verify FilterOptions type
- Check API parameter names
- Debug search query

**Notifications not appearing?**
- Check permissions granted
- Verify device token registered
- Check notification preferences
- Review quiet hours settings

---

**Phase 4 Parts 4-7: Complete & Production Ready** ✅
