# Phase 4 Parts 4-7: Integration Guide

## Overview

This guide explains how all Phase 4 features integrate together to create a cohesive user experience in the DryJets consumer mobile app.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Home Screen Tab                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ SearchBar (Part 6)                                   │  │
│  │ - Search merchants                                   │  │
│  │ - Recent searches                                    │  │
│  │ - Quick access                                       │  │
│  └────────┬─────────────────────────────────────────────┘  │
│           │                                                │
│  ┌────────▼─────────────────────────────────────────────┐  │
│  │ FilterSheet (Part 6) - Modal                        │  │
│  │ - Distance (1,5,10,20 miles)                        │  │
│  │ - Rating (3.0-4.5+)                                │  │
│  │ - Service Type                                      │  │
│  │ - Price Range                                       │  │
│  │ - Eco-Friendly, Same-Day toggles                   │  │
│  └────────┬─────────────────────────────────────────────┘  │
│           │                                                │
│  ┌────────▼──────────────────────────────────────────────┐ │
│  │ Merchant Results (Updated from filter)              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Orders Screen Tab                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Order List (Part 3)                                  │  │
│  │ - Active Orders                                      │  │
│  │ - Completed Orders                                   │  │
│  │ - [Leave Review] button ──────────────┐              │  │
│  └──────────────────────────────────────┬┘              │  │
│                                        │                 │  │
│                         ┌──────────────▼────────────┐    │  │
│                         │ Part 4: Review System     │    │  │
│                         │ ├── Create Review Screen  │    │  │
│                         │ │   - Rate (1-5 stars)   │    │  │
│                         │ │   - Comment             │    │  │
│                         │ │   - Tags                │    │  │
│                         │ │   - Recommend?          │    │  │
│                         │ │                         │    │  │
│                         │ └── Review Detail Screen  │    │  │
│                         │     - View review         │    │  │
│                         │     - Merchant response   │    │  │
│                         │     - Edit/Delete         │    │  │
│                         └─────────────────────────┘    │  │
│                                                        │  │
└────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Profile Screen Tab                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Profile Menu                                         │  │
│  │ - User Info                                          │  │
│  │ - Settings ──────────────────────────────┐           │  │
│  │ - Preferences                           │            │  │
│  │ - [Wardrobe] ────────┐                  │            │  │
│  └─────────────────────┬┘                  │            │  │
│                        │                   │            │  │
│         ┌──────────────▼────────────┐      │            │  │
│         │ Part 5: Wardrobe          │      │            │  │
│         │ ├── Grid View             │      │            │  │
│         │ │   - 2-column layout     │      │            │  │
│         │ │   - Item cards          │      │            │  │
│         │ │   - [+ Add Item]        │      │            │  │
│         │ │                         │      │            │  │
│         │ ├── Add Item Screen       │      │            │  │
│         │ │   - Name, color         │      │            │  │
│         │ │   - Category            │      │            │  │
│         │ │   - Fabric (16 options) │      │            │  │
│         │ │   - Care instructions   │      │            │  │
│         │ │   - Frequency           │      │            │  │
│         │ │                         │      │            │  │
│         │ └── Item Detail Screen    │      │            │  │
│         │     - View all details    │      │            │  │
│         │     - Usage tracking      │      │            │  │
│         │     - Delete              │      │            │  │
│         └─────────────────────────┘       │            │  │
│                                           │            │  │
│         ┌──────────────────────────────────▼─────────┐  │  │
│         │ Part 7: Notification Settings              │  │  │
│         │ ├── Orders                                 │  │  │
│         │ │   - Toggle Enable                        │  │  │
│         │ │   - Toggle Sound                         │  │  │
│         │ │   - Toggle Vibration                     │  │  │
│         │ │                                          │  │  │
│         │ ├── Driver Updates                         │  │  │
│         │ │   - Toggle Enable                        │  │  │
│         │ │   - Toggle Sound                         │  │  │
│         │ │   - Toggle Vibration                     │  │  │
│         │ │                                          │  │  │
│         │ ├── Promotions & Subscriptions             │  │  │
│         │ │   - Toggle Enable                        │  │  │
│         │ │   - Toggle Sound                         │  │  │
│         │ │   - Toggle Vibration                     │  │  │
│         │ │                                          │  │  │
│         │ ├── Quiet Hours                            │  │  │
│         │ │   - Set start time                       │  │  │
│         │ │   - Set end time                         │  │  │
│         │ │   - Do Not Disturb toggle                │  │  │
│         │ │                                          │  │  │
│         │ └── Save/Reset                             │  │  │
│         └──────────────────────────────────────────┘  │  │
│                                                        │  │
└────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           System Layer: Notifications (Part 7)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Socket.io Events (Part 1-2)                          │  │
│  │ - order:status-changed                               │  │
│  │ - driver:location-updated                            │  │
│  │ - order:completed                                    │  │
│  └─────────────┬──────────────────────────────────────┘  │
│                │                                        │  │
│  ┌─────────────▼──────────────────────────────────────┐  │
│  │ NotificationsManager                               │  │
│  │ - Request permissions                              │  │
│  │ - Get device token                                 │  │
│  │ - Handle notifications                             │  │
│  │ - Show local notifications                         │  │
│  └─────────────┬──────────────────────────────────────┘  │
│                │                                        │  │
│  ┌─────────────▼──────────────────────────────────────┐  │
│  │ NotificationPreferencesManager                     │  │
│  │ - Check if enabled (respects quiet hours)          │  │
│  │ - Check sound preference                           │  │
│  │ - Check vibration preference                       │  │
│  │ - Load/save preferences                            │  │
│  └─────────────┬──────────────────────────────────────┘  │
│                │                                        │  │
│  ┌─────────────▼──────────────────────────────────────┐  │
│  │ User sees notification                             │  │
│  │ ├── Title + Body                                   │  │
│  │ ├── Sound (if enabled & not quiet hours)           │  │
│  │ └── Vibration (if enabled & not quiet hours)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Data Flow Examples

### Example 1: User Leaves a Review

```
1. User completes order
   ↓
2. Orders Screen shows "Leave Review" button (Part 3)
   ↓
3. User taps button → Create Review Screen opens (Part 4)
   ↓
4. User fills out review:
   - Select rating with RatingSelector
   - Type comment
   - Select tags
   - Choose recommendation
   ↓
5. Submit review → ordersApi.submitReview()
   ↓
6. Backend creates review + notification
   ↓
7. Notification event received via Socket.io (Part 1)
   ↓
8. NotificationsManager receives event
   ↓
9. Check NotificationPreferences
   - Is notifications enabled? ✓
   - Not in quiet hours? ✓
   - Play sound? ✓
   - Vibrate? ✓
   ↓
10. Show notification: "Review submitted!"
    ↓
11. User can view review in ReviewDetail screen
```

### Example 2: User Adds Wardrobe Item

```
1. User opens Profile → Wardrobe (Part 5)
   ↓
2. WardrobeGrid shows existing items
   ↓
3. User taps [+ Add Item]
   ↓
4. Add Item Screen opens
   - Enter name "Blue Jeans"
   - Enter color "Blue"
   - Select category "Pants"
   - Select fabric "Denim" (FabricSelector)
   - Enter care "Cold wash"
   - Select frequency "Monthly"
   ↓
5. Submit → wardrobeApi.create()
   ↓
6. Item added to wardrobe
   ↓
7. Grid refreshes (React Query refetch)
   ↓
8. User can now see item in grid
   ↓
9. Can tap item to see details (usage, last cleaned, etc.)
```

### Example 3: User Searches with Filters

```
1. User opens Home screen (Part 6)
   ↓
2. SearchBar visible with search input
   ↓
3. User types "Clean Co"
   ↓
4. Recent searches appear below
   ↓
5. User taps filter button → FilterSheet opens
   ↓
6. User adjusts filters:
   - Distance: 5 miles
   - Rating: 4+
   - Service Type: Dry Cleaning
   - Price: Standard
   - Eco-friendly: ON
   - Same-day: ON
   ↓
7. User taps [Apply]
   ↓
8. ordersApi.search() called with all filters
   ↓
9. Results updated with merchant list
   ↓
10. User can tap merchant to see details (Part 3)
```

### Example 4: User Receives Notification

```
1. Order status changes on backend
   ↓
2. Socket.io emits "driver:on-way" event (Part 1)
   ↓
3. Event captured in app
   ↓
4. NotificationsManager.handleNotification()
   ↓
5. Check type: "driver:on-way"
   ↓
6. Look up message template: "On The Way"
   ↓
7. Check NotificationPreferences (Part 7):
   - Driver notifications enabled? ✓
   - In quiet hours? ✗
   - Sound enabled? ✓
   - Vibration enabled? ✓
   ↓
8. Show local notification
   - Title: "On The Way"
   - Body: "Driver is on the way (ETA: 15 min)"
   - Sound: Play
   - Vibration: Vibrate
   ↓
9. User sees notification badge
   ↓
10. User taps notification → Opens order detail screen
    ↓
11. Can tap [View Map] to see live driver location (Part 2)
```

---

## Component Dependencies

### Part 4: Reviews
```
create-review.tsx (Screen)
├── ReviewForm
│   ├── RatingSelector
│   └── UI Components (TextInput, TouchableOpacity, etc.)
├── ordersApi
└── useAuthStore

[id].tsx (Screen)
├── ReviewDisplay
│   └── RatingSelector
├── ordersApi
└── useAuthStore
```

### Part 5: Wardrobe
```
index.tsx (Screen)
├── WardrobeGrid
│   └── Image, TouchableOpacity
├── wardrobeApi
└── useAuthStore

add-item.tsx (Screen)
├── FabricSelector
├── TextInput, TouchableOpacity
├── wardrobeApi
└── useAuthStore

[id].tsx (Screen)
├── Image
├── wardrobeApi
└── useAuthStore
```

### Part 6: Search
```
Home Screen (enhanced with Part 6)
├── SearchBar
│   ├── TextInput
│   └── Recent searches list
├── FilterSheet
│   ├── Toggles (Switch)
│   ├── Selection buttons
│   └── Apply/Reset
├── ordersApi
└── Merchant list display
```

### Part 7: Notifications
```
App Initialization (Root Layout)
└── useNotifications
    ├── notificationsManager
    ├── NotificationPreferencesManager
    └── notificationsApi

Notification Settings Screen
├── NotificationPreferencesManager
└── notificationsApi

Throughout App
└── useNotifications (for unread count badge)
```

---

## State Management Integration

### Zustand Stores Used
- `useAuthStore` - User ID, authentication
- `useOrdersStore` - Order list (refreshed after review)
- `useUIStore` - UI state for modals

### React Query Integration
- **Part 4**: Query cache invalidation on review submit
- **Part 5**: Query refetch on add/delete wardrobe item
- **Part 6**: Search results with pagination
- **Part 7**: Notification list and preferences caching

### AsyncStorage Integration
- **Part 7**: Notification preferences stored locally

---

## API Flow Integration

```
API Layer (lib/api.ts)
│
├─ Part 4 Endpoints
│  ├── ordersApi.submitReview()
│  ├── ordersApi.getReview()
│  └── ordersApi.deleteReview()
│
├─ Part 5 Endpoints
│  ├── wardrobeApi.create()
│  ├── wardrobeApi.list()
│  ├── wardrobeApi.update()
│  └── wardrobeApi.delete()
│
├─ Part 6 Endpoints
│  ├── ordersApi.search() ← NEW
│  └── Merchant filtering logic
│
└─ Part 7 Endpoints
   ├── notificationsApi.registerDeviceToken()
   ├── notificationsApi.list()
   ├── notificationsApi.markAsRead()
   └── notificationsApi.updatePreferences()
```

---

## Navigation Flow

### From Orders Tab (Part 3)
```
Orders Screen
├── Order Item
│   ├── [View Details] → Order Detail
│   │   ├── [View Map] → Tracking Map (Part 2)
│   │   └── [Leave Review] → Create Review (Part 4)
│   │       └── Review Detail (Part 4)
│   │           ├── [Edit]
│   │           ├── [Delete]
│   │           └── See Merchant Response
│   │
│   └── [Reorder] → Cart
```

### From Home Tab (Part 6)
```
Home Screen
├── SearchBar + FilterSheet
│   ├── [Search] → Merchant Results
│   ├── [Filter] → FilterSheet Modal
│   │   ├── [Apply] → Filtered Results
│   │   └── [Reset] → Clear Filters
│   │
│   └── Merchant Item
│       └── [Tap] → Merchant Detail
│           ├── [Add to Cart]
│           ├── [View Reviews]
│           └── [Leave Review]
```

### From Profile Tab (Part 5, Part 7)
```
Profile Screen
├── [Wardrobe] → Wardrobe Screen (Part 5)
│   ├── [+ Add Item] → Add Item Screen
│   │   └── [Fabric Selector] ← Horizontal Scroll
│   │
│   └── Item Card
│       └── [Tap] → Item Detail
│           ├── [View Details]
│           ├── [Edit]
│           ├── [Delete]
│           └── [Usage Stats]
│
└── [Settings] → Settings Screen
    └── [Notifications] → Notification Settings (Part 7)
        ├── [Orders Toggle]
        ├── [Driver Toggle]
        ├── [Promotions Toggle]
        ├── [Subscriptions Toggle]
        ├── [Sound/Vibration Controls]
        ├── [Quiet Hours]
        └── [Save/Reset]
```

---

## Real-Time Integration (Part 1 + Part 7)

```
Backend Event
│
├── Socket.io emits event
│   (e.g., "driver:on-way")
│
├── App receives via Socket.io connection (Part 1)
│
├── Event triggers notification system (Part 7)
│
├── NotificationsManager.handleNotification()
│   │
│   ├── Check NotificationPreferences
│   │   ├── Is enabled?
│   │   ├── Not in quiet hours?
│   │   ├── Sound allowed?
│   │   └── Vibration allowed?
│   │
│   └── Show notification
│       ├── Display to user
│       ├── Play sound (if enabled)
│       └── Vibrate device (if enabled)
│
└── User taps → Action taken
    (e.g., view order, see driver location on map)
```

---

## Performance Considerations

### Lazy Loading
- Review screens lazy-load when accessed
- Wardrobe grid uses pagination
- Filter results load on-demand

### Caching
- React Query caches review data
- React Query caches wardrobe items
- AsyncStorage caches preferences

### Optimization
- Memoized components prevent re-renders
- Images use React Native's Image component
- Lists use FlatList for efficiency

---

## Testing Integration Points

### Unit Tests
- Review components (RatingSelector, ReviewForm)
- Wardrobe components (WardrobeGrid, FabricSelector)
- Search filters logic
- Notification preferences

### Integration Tests
- Review submission flow
- Wardrobe add/edit/delete
- Search with filters
- Notification delivery

### E2E Tests
- Complete review flow (create, view, edit, delete)
- Complete wardrobe flow (add, browse, detail)
- Complete search flow (search, filter, view results)
- Complete notification flow (permission, receive, settings)

---

## Security Integration

### Part 4: Reviews
- Only authors can edit/delete (checked via customerId)
- API validates ownership on backend

### Part 5: Wardrobe
- Only user's items shown (filtered by customerId)
- Delete requires confirmation

### Part 6: Search
- No sensitive data exposed
- Filter parameters safe

### Part 7: Notifications
- Device tokens stored securely
- Preferences encrypted in storage
- Proper permission requests

---

## Summary

All four new parts (4-7) integrate seamlessly with the existing Phase 1-3 implementation:

- **Part 4** enhances order experience with reviews
- **Part 5** adds personal wardrobe management
- **Part 6** improves merchant discovery
- **Part 7** provides real-time notifications

Together they create a complete, production-ready mobile app experience.

---

**Integration Guide Complete** ✅
