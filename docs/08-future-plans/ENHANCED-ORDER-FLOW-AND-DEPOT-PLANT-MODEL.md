# Enhanced Order Flow & Depot/Plant Business Model - Implementation Plan

**Status:** Planning Phase - Not Yet Started
**Priority:** High
**Estimated Timeline:** 5-6 weeks
**Created:** 2025-10-23

---

## Executive Summary

This document outlines the comprehensive plan to:
1. Transform the current order flow into a world-class, personalized experience
2. Implement the Depot vs Plant business model with proper governance
3. Add merchant selection and smart routing algorithms
4. Integrate wardrobe management and customer preferences
5. Enhance visual design with real images and interactive elements

---

## Research Summary

### Current State Analysis

**What Exists:**
- ✅ Basic 4-step order wizard (Service → Items → Schedule → Review)
- ✅ Prisma schema supports: Customer preferences, FavoriteMerchant, WardrobeItem, Subscription models
- ✅ Backend order creation with dynamic pricing based on fulfillment mode
- ✅ Payment system (Stripe) 100% complete
- ✅ Real-time tracking infrastructure (Socket.io)

**Critical Gaps:**
- ❌ Frontend sends raw address objects; backend expects Address IDs
- ❌ No merchant selection UI - user can't choose their "home store"
- ❌ No merchant routing algorithm (backend requires explicit merchantId)
- ❌ Schema missing DEPOT and PLANT merchant types
- ❌ Frontend uses emoji icons instead of real product images
- ❌ Wardrobe system exists in schema but 0% UI implementation
- ❌ Customer preferences exist but aren't exposed in order flow
- ❌ No photo upload for damage/stains
- ❌ No subscription setup in order flow
- ❌ No saved address quick-select

### Frontend-Backend API Mismatch

**Frontend Currently Sends:**
```typescript
{
  serviceType: string,  // "dry-cleaning", "laundry", etc.
  items: [{ type, quantity, specialInstructions }],
  pickupAddress: { street, city, state, zipCode, apartment },  // ❌ Raw object
  deliveryAddress: { ... },  // ❌ Raw object
  pickupDate: string,
  pickupTimeSlot: string,
  deliveryDate: string,
  specialInstructions: string
}
```

**Backend Expects (CreateOrderDto):**
```typescript
{
  customerId: string,  // ✅ Added by tRPC
  merchantId: string,  // ❌ MISSING!
  merchantLocationId: string,  // ❌ MISSING!
  pickupAddressId: string,  // ❌ Expects ID, not object
  deliveryAddressId: string,  // ❌ Expects ID, not object
  items: [{
    serviceId,  // ❌ MISSING! Frontend has generic "type"
    itemName,
    description,
    quantity,
    specialInstructions,
    photoUrl  // ❌ MISSING!
  }],
  fulfillmentMode?: FulfillmentMode,  // ❌ MISSING!
  scheduledPickupAt?: string,
  scheduledDeliveryAt?: string,
  specialInstructions?: string
}
```

---

## Phase 1: Database Schema & Business Model (2-3 days)

### 1.1 Extend Merchant Types

**File:** `packages/database/prisma/schema.prisma`

**Changes:**
```prisma
enum MerchantType {
  DRY_CLEANER
  LAUNDROMAT
  BOTH
  DEPOT              // NEW: Retail drop-off location
  PLANT              // NEW: Actual processing facility
  DEPOT_AND_PLANT    // NEW: Hybrid business
}

model Merchant {
  // ... existing fields ...

  // NEW FIELDS:
  isDepot                  Boolean   @default(false)
  isPlant                  Boolean   @default(false)
  maxDailyCapacity         Int?
  currentCapacity          Int       @default(0)
  availabilitySchedule     Json?     // Operating hours, blackout dates
  certificationBadges      String[]  // ["Eco-Friendly", "Fast Turnaround"]
  geographicExclusivityZone Json?    // GeoJSON polygon for depot territories
  minRatingRequired        Float     @default(4.0)

  // NEW RELATIONSHIPS:
  depotPartnerships  DepotPlantPartnership[] @relation("DepotPartner")
  plantPartnerships  DepotPlantPartnership[] @relation("PlantPartner")
  orderDistribution  MerchantOrderDistribution[]
}
```

### 1.2 Create Depot-Plant Relationship Model

```prisma
model DepotPlantPartnership {
  id                String   @id @default(cuid())
  depotId           String
  plantId           String
  isActive          Boolean  @default(true)
  isPubliclyVisible Boolean  @default(false)  // Optional transparency
  commissionRate    Float    @default(0.15)   // Depot's cut
  exclusiveTerritory Json?   // Optional exclusive service area
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  depot Merchant @relation("DepotPartner", fields: [depotId], references: [id])
  plant Merchant @relation("PlantPartner", fields: [plantId], references: [id])

  @@unique([depotId, plantId])
  @@index([depotId])
  @@index([plantId])
}
```

### 1.3 Fair Rotation & Capacity Tracking

```prisma
model MerchantOrderDistribution {
  id              String   @id @default(cuid())
  merchantId      String
  date            DateTime @default(now())
  ordersReceived  Int      @default(0)
  ordersCompleted Int      @default(0)
  capacityUsed    Int      @default(0)

  merchant Merchant @relation(fields: [merchantId], references: [id])

  @@unique([merchantId, date])
  @@index([date])
}
```

---

## Phase 2: Backend - Merchant Selection & Routing (3-4 days)

### 2.1 Create Merchant Routing Service

**New File:** `apps/api/src/modules/merchants/merchant-routing.service.ts`

**Smart Routing Algorithm:**

```typescript
interface RoutingParams {
  customerId: string;
  pickupAddress: { lat: number; lng: number };
  requestedServiceType: string;
  scheduledDate: Date;
}

interface MerchantScore {
  merchantId: string;
  score: number;
  breakdown: {
    isPreferred: boolean;
    distanceScore: number;      // 0-100 (closer = higher)
    ratingScore: number;         // 0-100 (4.0 = 0, 5.0 = 100)
    capacityScore: number;       // 0-100 (available capacity)
    fairnessScore: number;       // 0-100 (rotation fairness)
    priceScore: number;          // 0-100 (lower price = higher, but weighted less)
  };
}

async selectMerchant(params: RoutingParams): Promise<Merchant[]> {
  // 1. Check for preferred merchant (FavoriteMerchant table)
  const preferred = await this.getPreferredMerchant(params.customerId);
  if (preferred && await this.isAvailable(preferred, params)) {
    return [preferred, ...await this.getAlternatives(params, 4)];
  }

  // 2. Get all eligible merchants
  const merchants = await this.getEligibleMerchants(params);

  // 3. Score each merchant
  const scored = await Promise.all(
    merchants.map(m => this.scoreMerchant(m, params))
  );

  // 4. Weight and rank (total score = weighted sum)
  const weights = {
    distance: 0.30,      // Proximity important for pickup/delivery
    rating: 0.25,        // Quality matters
    capacity: 0.25,      // Must be able to handle order
    fairness: 0.15,      // Distribute orders fairly
    price: 0.05          // Secondary consideration
  };

  scored.forEach(s => {
    s.score =
      s.breakdown.distanceScore * weights.distance +
      s.breakdown.ratingScore * weights.rating +
      s.breakdown.capacityScore * weights.capacity +
      s.breakdown.fairnessScore * weights.fairness +
      s.breakdown.priceScore * weights.price;
  });

  // 5. Return top 5 ranked merchants
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.merchant);
}
```

**Geographic Exclusivity Check:**
```typescript
async checkExclusivity(merchant: Merchant, pickupAddress: GeoPoint): Promise<boolean> {
  if (!merchant.geographicExclusivityZone) return true;

  // Check if pickup address falls within depot's exclusive territory
  const isInTerritory = geolib.isPointInPolygon(
    pickupAddress,
    merchant.geographicExclusivityZone
  );

  if (isInTerritory && merchant.isDepot) {
    // Check if this depot's partner plants are trying to serve this area
    const plantPartners = await this.getPlantPartners(merchant.id);
    // Exclude partner plants from serving this territory directly
    return true;
  }

  return true;
}
```

### 2.2 Add Merchant Endpoints

**File:** `apps/api/src/modules/merchants/merchants.controller.ts`

**New Endpoints:**

```typescript
@Get('nearby')
async findNearbyMerchants(
  @Query('lat') lat: number,
  @Query('lng') lng: number,
  @Query('radius') radius: number = 10, // miles
  @Query('serviceType') serviceType?: string,
): Promise<Merchant[]> {
  return this.merchantsService.findNearby({ lat, lng }, radius, serviceType);
}

@Get(':id/availability')
async checkAvailability(
  @Param('id') merchantId: string,
  @Query('date') date: string,
): Promise<{ available: boolean; capacity: number; nextAvailable?: Date }> {
  return this.merchantsService.checkAvailability(merchantId, new Date(date));
}

@Get(':id/services')
async getServices(@Param('id') merchantId: string): Promise<Service[]> {
  return this.merchantsService.getServiceCatalog(merchantId);
}

@Post(':id/favorite')
async addFavorite(
  @Param('id') merchantId: string,
  @Body('customerId') customerId: string,
): Promise<FavoriteMerchant> {
  return this.merchantsService.addToFavorites(customerId, merchantId);
}

@Delete(':id/favorite')
async removeFavorite(
  @Param('id') merchantId: string,
  @Query('customerId') customerId: string,
): Promise<void> {
  return this.merchantsService.removeFromFavorites(customerId, merchantId);
}
```

### 2.3 Enhance Order Creation

**File:** `apps/api/src/modules/orders/orders.service.ts`

**Updates:**

```typescript
async createOrder(createOrderDto: CreateOrderDto) {
  // NEW: Make merchantId optional
  let merchantId = createOrderDto.merchantId;

  if (!merchantId) {
    // Auto-select merchant using routing algorithm
    const routing = await this.merchantRouting.selectMerchant({
      customerId: createOrderDto.customerId,
      pickupAddress: createOrderDto.pickupAddressCoordinates,
      requestedServiceType: createOrderDto.serviceType,
      scheduledDate: new Date(createOrderDto.scheduledPickupAt),
    });

    merchantId = routing[0].id; // Use top-ranked merchant
    createOrderDto.merchantLocationId = routing[0].locations[0].id;
  }

  // NEW: Validate capacity before creating order
  const hasCapacity = await this.validateMerchantCapacity(
    merchantId,
    createOrderDto.scheduledPickupAt
  );

  if (!hasCapacity) {
    throw new BadRequestException('Merchant at capacity for requested date');
  }

  // ... existing order creation logic ...

  // NEW: Update capacity counter
  await this.prisma.merchant.update({
    where: { id: merchantId },
    data: { currentCapacity: { increment: 1 } },
  });

  // NEW: Track for fair distribution
  await this.prisma.merchantOrderDistribution.upsert({
    where: {
      merchantId_date: {
        merchantId,
        date: new Date().toISOString().split('T')[0],
      },
    },
    update: { ordersReceived: { increment: 1 } },
    create: {
      merchantId,
      date: new Date(),
      ordersReceived: 1,
    },
  });

  return order;
}
```

---

## Phase 3: Frontend - Enhanced Order Flow UI (5-7 days)

### 3.1 New 6-Step Order Flow

**File:** `apps/web-customer/src/app/orders/new/page.tsx`

**Complete Redesign:**

```typescript
type OrderStep =
  | 'service'       // Step 1: Service type & fulfillment mode
  | 'merchant'      // Step 2: Merchant selection
  | 'items'         // Step 3: Items & wardrobe
  | 'addresses'     // Step 4: Addresses & schedule
  | 'review'        // Step 5: Review & personalize
  | 'payment';      // Step 6: Payment & confirmation

interface EnhancedOrderState {
  // Step 1
  serviceType: 'dry-cleaning' | 'laundry' | 'alterations' | 'special-care';
  fulfillmentMode: FulfillmentMode;
  preferences: {
    detergent?: string;
    foldOption?: 'HANGER' | 'FOLD';
    starchLevel?: 'NONE' | 'LIGHT' | 'MEDIUM' | 'HEAVY';
  };

  // Step 2
  selectedMerchant?: Merchant;
  merchantOptions: Merchant[];

  // Step 3
  items: EnhancedOrderItem[];
  wardrobeItems: string[];  // WardrobeItem IDs

  // Step 4
  pickupAddressId: string;
  deliveryAddressId: string;
  scheduledPickupAt: Date;
  scheduledDeliveryAt: Date;
  isSubscription: boolean;
  subscriptionFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

  // Step 5
  specialInstructions?: string;
  tip: number;
  promoCode?: string;
}

interface EnhancedOrderItem {
  serviceId: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  photoUrl?: string;  // For damage/stain photos
}
```

### 3.2 Step-by-Step UI Design

#### Step 1: Service Type & Preferences

**Visual Design:**
```tsx
// Service Type Cards (2x2 grid with real images)
<div className="grid grid-cols-2 gap-6">
  {services.map(service => (
    <ServiceCard
      key={service.id}
      image={service.heroImage}  // Real photo, not emoji
      title={service.name}
      description={service.tagline}
      selected={serviceType === service.id}
      onClick={() => setServiceType(service.id)}
    />
  ))}
</div>

// Fulfillment Mode Selector (horizontal cards with icons & pricing)
<FulfillmentModeSelector
  modes={[
    {
      id: 'FULL_SERVICE',
      icon: <TruckIcon />,
      title: 'Full Service',
      description: 'We pickup and deliver',
      discount: 0,
      popular: true
    },
    {
      id: 'CUSTOMER_DROPOFF_PICKUP',
      icon: <StoreIcon />,
      title: 'Drop-off & Pickup',
      description: 'You drop-off and pickup',
      discount: 30,
      badgeText: 'Save 30%'
    },
    // ... other modes
  ]}
  selected={fulfillmentMode}
  onChange={setFulfillmentMode}
/>

// Quick Preferences (expandable section)
<Disclosure>
  <Disclosure.Button>⚙️ Set Preferences (Optional)</Disclosure.Button>
  <Disclosure.Panel>
    <PreferenceSelector
      type="detergent"
      options={['Standard', 'Hypoallergenic', 'Eco-Friendly']}
      value={preferences.detergent}
      onChange={v => setPreferences({...preferences, detergent: v})}
    />
    {/* Similar for fold option and starch level */}
  </Disclosure.Panel>
</Disclosure>
```

#### Step 2: Merchant Selection

**Visual Design:**
```tsx
// Home Store Banner (if exists)
{favorMerchant && (
  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200 mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img src={favoriteMerchant.logo} className="w-16 h-16 rounded-full" />
        <div>
          <div className="flex items-center gap-2">
            <StarIcon className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">Your Home Store</span>
          </div>
          <h3 className="text-xl font-bold">{favoriteMerchant.businessName}</h3>
          <p className="text-sm text-gray-600">
            {favoriteMerchant.distance} mi • {favoriteMerchant.estimatedTurnaround}
          </p>
        </div>
      </div>
      <button className="btn-primary">Continue with Home Store</button>
    </div>
  </div>
)}

// Alternative Merchants Grid
<div className="mb-4">
  <h3 className="text-lg font-semibold mb-2">
    {favoriteMerchant ? 'Or choose a different merchant' : 'Available Merchants Near You'}
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {merchantOptions.map(merchant => (
      <MerchantCard
        key={merchant.id}
        merchant={merchant}
        selected={selectedMerchant?.id === merchant.id}
        onClick={() => setSelectedMerchant(merchant)}
        showDetails={{
          image: merchant.photos[0],
          name: merchant.businessName,
          rating: merchant.rating,
          reviewCount: merchant.ratingCount,
          distance: calculateDistance(pickupAddress, merchant.location),
          turnaround: merchant.avgTurnaroundTime,
          priceRange: merchant.priceRange, // '$', '$$', '$$$'
          badges: merchant.certificationBadges,
          isAvailable: merchant.currentCapacity < merchant.maxDailyCapacity
        }}
      />
    ))}
  </div>
</div>

// Set as Home Store (if different merchant selected)
{selectedMerchant && selectedMerchant.id !== favoriteMerchant?.id && (
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={saveAsHomeStore} onChange={e => setSaveAsHomeStore(e.target.checked)} />
    <span>Set as my Home Store</span>
  </label>
)}
```

#### Step 3: Items & Wardrobe

**Visual Design:**
```tsx
// Tab Navigation
<Tabs value={itemTab} onValueChange={setItemTab}>
  <TabsList>
    <TabsTrigger value="new">Add New Items</TabsTrigger>
    <TabsTrigger value="wardrobe">
      From Wardrobe ({wardrobeItems.length})
    </TabsTrigger>
    <TabsTrigger value="reorder">Reorder Previous</TabsTrigger>
  </TabsList>

  {/* Tab: Add New Items */}
  <TabsContent value="new">
    {/* Fetch services from selectedMerchant */}
    <ServiceCatalog
      merchantId={selectedMerchant.id}
      onAddItem={(service, quantity, instructions, photo) => {
        addItem({
          serviceId: service.id,
          itemName: service.name,
          description: service.description,
          quantity,
          unitPrice: service.basePrice,
          totalPrice: service.basePrice * quantity,
          specialInstructions: instructions,
          photoUrl: photo,
        });
      }}
      renderServiceCard={(service) => (
        <div className="border rounded-lg p-4 hover:shadow-lg transition">
          <img src={service.imageUrl} className="w-full h-48 object-cover rounded-md" />
          <h4 className="font-semibold mt-2">{service.name}</h4>
          <p className="text-sm text-gray-600">{service.description}</p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-lg font-bold">${service.basePrice}</span>
            <div className="flex items-center gap-2">
              <QuantitySelector value={1} onChange={setQuantity} />
              <button className="btn-sm btn-primary">Add</button>
            </div>
          </div>

          {/* Photo Upload for Stains/Damage */}
          <FileUpload
            accept="image/*"
            label="Upload photo (optional)"
            hint="Show any stains or damage"
            onUpload={setPhotoUrl}
          />

          {/* Special Instructions */}
          <textarea
            placeholder="Special instructions (optional)"
            className="w-full mt-2 p-2 border rounded"
          />
        </div>
      )}
    />
  </TabsContent>

  {/* Tab: From Wardrobe */}
  <TabsContent value="wardrobe">
    <WardrobeItemGrid
      items={customerWardrobe}
      selected={selectedWardrobeItems}
      onToggle={(itemId) => toggleWardrobeItem(itemId)}
      renderItem={(item) => (
        <div className="relative">
          <img src={item.photoUrl} className="w-full h-48 object-cover rounded-lg" />
          <div className="absolute top-2 right-2">
            <Checkbox checked={selectedWardrobeItems.includes(item.id)} />
          </div>
          <div className="p-2">
            <h5 className="font-medium">{item.name}</h5>
            <p className="text-xs text-gray-500">
              Last cleaned: {formatDate(item.lastCleanedAt)}
            </p>
            <p className="text-xs text-gray-500">
              Cleaned {item.cleaningCount} times
            </p>
          </div>
        </div>
      )}
    />
  </TabsContent>

  {/* Tab: Reorder Previous */}
  <TabsContent value="reorder">
    <PreviousOrdersList
      customerId={customerId}
      onReorderItems={(orderItems) => {
        orderItems.forEach(item => addItem(item));
      }}
    />
  </TabsContent>
</Tabs>

{/* Live Pricing Calculator (sticky bottom) */}
<div className="sticky bottom-0 bg-white border-t p-4 shadow-lg">
  <PricingCalculator
    subtotal={calculateSubtotal(items)}
    serviceFee={calculateServiceFee(fulfillmentMode)}
    deliveryFee={fulfillmentMode === 'FULL_SERVICE' ? 5.99 : 0}
    discount={calculateDiscount(fulfillmentMode)}
    tax={calculateTax()}
    total={calculateTotal()}
    animated
  />
</div>
```

#### Step 4: Addresses & Schedule

**Visual Design:**
```tsx
// Pickup Address
<div className="space-y-4">
  <h3 className="font-semibold">Pickup Address</h3>

  {savedAddresses.length > 0 ? (
    <>
      <AddressSelector
        addresses={savedAddresses}
        selected={pickupAddressId}
        onChange={setPickupAddressId}
        renderAddress={(addr) => (
          <div className="border p-4 rounded-lg cursor-pointer hover:border-blue-500">
            <p className="font-medium">{addr.street}</p>
            <p className="text-sm text-gray-600">
              {addr.city}, {addr.state} {addr.zipCode}
            </p>
          </div>
        )}
      />
      <button onClick={() => setShowNewAddressForm(true)}>
        + Add New Address
      </button>
    </>
  ) : (
    <AddressForm
      onSave={async (address) => {
        const saved = await createAddress(address);
        setPickupAddressId(saved.id);
        setSavedAddresses([...savedAddresses, saved]);
      }}
      showSaveCheckbox
    />
  )}
</div>

// Delivery Address
<div className="mt-6">
  <label className="flex items-center gap-2 mb-4">
    <input
      type="checkbox"
      checked={sameAsPickup}
      onChange={e => setSameAsPickup(e.target.checked)}
    />
    <span>Delivery address same as pickup</span>
  </label>

  {!sameAsPickup && (
    <AddressSelector
      addresses={savedAddresses}
      selected={deliveryAddressId}
      onChange={setDeliveryAddressId}
    />
  )}
</div>

// Schedule (Date & Time)
<div className="mt-6 space-y-4">
  <div>
    <label className="block font-medium mb-2">Pickup Date</label>
    <DatePicker
      value={pickupDate}
      onChange={setPickupDate}
      minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Tomorrow
      disabledDates={merchantUnavailableDates}
    />
  </div>

  <div>
    <label className="block font-medium mb-2">Pickup Time</label>
    <TimeSlotPicker
      slots={[
        { id: '9-12', label: 'Morning', time: '9:00 AM - 12:00 PM', icon: '🌅' },
        { id: '12-3', label: 'Afternoon', time: '12:00 PM - 3:00 PM', icon: '☀️' },
        { id: '3-6', label: 'Evening', time: '3:00 PM - 6:00 PM', icon: '🌆' },
        { id: '6-9', label: 'Night', time: '6:00 PM - 9:00 PM', icon: '🌙' },
      ]}
      selected={timeSlot}
      onChange={setTimeSlot}
    />
  </div>

  {/* Estimated Delivery (auto-calculated) */}
  <div className="bg-blue-50 p-4 rounded-lg">
    <p className="text-sm text-gray-700">
      Estimated delivery: <strong>{formatDate(estimatedDelivery)}</strong>
    </p>
    <p className="text-xs text-gray-500 mt-1">
      Based on {selectedMerchant.avgTurnaroundTime} average turnaround
    </p>
  </div>
</div>

// Subscription Option
<div className="mt-6 border-t pt-6">
  <label className="flex items-center gap-3">
    <Switch checked={isSubscription} onChange={setIsSubscription} />
    <div>
      <span className="font-medium">Make this a recurring order</span>
      <p className="text-sm text-gray-500">Save time with automatic scheduling</p>
    </div>
  </label>

  {isSubscription && (
    <div className="mt-4">
      <label className="block font-medium mb-2">Frequency</label>
      <div className="flex gap-3">
        {['Weekly', 'Bi-weekly', 'Monthly'].map(freq => (
          <button
            key={freq}
            className={`px-6 py-3 rounded-lg border-2 ${
              subscriptionFrequency === freq.toUpperCase()
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300'
            }`}
            onClick={() => setSubscriptionFrequency(freq.toUpperCase())}
          >
            {freq}
          </button>
        ))}
      </div>
    </div>
  )}
</div>
```

#### Step 5: Review & Personalize

**Visual Design:**
```tsx
<div className="space-y-6">
  {/* Order Summary with Edit Buttons */}
  <OrderSummaryCard
    sections={[
      {
        title: 'Service',
        content: `${serviceType} • ${fulfillmentMode}`,
        onEdit: () => setCurrentStep('service'),
      },
      {
        title: 'Merchant',
        content: selectedMerchant.businessName,
        onEdit: () => setCurrentStep('merchant'),
      },
      {
        title: 'Items',
        content: `${items.length} items`,
        details: items.map(item => `${item.itemName} x${item.quantity}`),
        onEdit: () => setCurrentStep('items'),
      },
      {
        title: 'Pickup',
        content: formatAddress(pickupAddress),
        details: `${formatDate(scheduledPickupAt)} at ${timeSlot}`,
        onEdit: () => setCurrentStep('addresses'),
      },
    ]}
  />

  {/* Special Instructions */}
  <div>
    <label className="block font-medium mb-2">Special Instructions</label>
    <textarea
      rows={4}
      value={specialInstructions}
      onChange={e => setSpecialInstructions(e.target.value)}
      placeholder="Any additional notes for the driver or merchant..."
      className="w-full border rounded-lg p-3"
    />
  </div>

  {/* Tip Selector */}
  <div>
    <label className="block font-medium mb-2">Add Tip for Driver</label>
    <TipSelector
      options={[
        { label: '15%', value: subtotal * 0.15 },
        { label: '18%', value: subtotal * 0.18, popular: true },
        { label: '20%', value: subtotal * 0.20 },
        { label: 'Custom', value: null },
      ]}
      selected={tip}
      onChange={setTip}
    />
  </div>

  {/* Promo Code */}
  <div>
    <PromoCodeInput
      value={promoCode}
      onChange={setPromoCode}
      onApply={async () => {
        const validation = await validatePromoCode(promoCode);
        if (validation.valid) {
          setDiscount(validation.discountAmount);
        }
      }}
    />
  </div>

  {/* Final Pricing Breakdown (Animated) */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl"
  >
    <h3 className="font-semibold text-lg mb-4">Pricing Breakdown</h3>
    <div className="space-y-2">
      <PriceRow label="Subtotal" amount={subtotal} />
      <PriceRow label="Service Fee" amount={serviceFee} />
      <PriceRow label="Delivery Fee" amount={deliveryFee} />
      {discount > 0 && (
        <PriceRow label="Discount" amount={-discount} color="green" />
      )}
      <PriceRow label="Tax" amount={taxAmount} />
      <PriceRow label="Tip" amount={tip} />
      <div className="border-t pt-2 mt-2">
        <PriceRow label="Total" amount={totalAmount} bold large />
      </div>
    </div>

    {/* Loyalty Points */}
    <div className="mt-4 bg-white p-3 rounded-lg flex items-center justify-between">
      <span className="text-sm">You'll earn</span>
      <span className="font-bold text-blue-600">+{Math.floor(totalAmount)} points</span>
    </div>
  </motion.div>
</div>
```

#### Step 6: Payment & Confirmation

```tsx
// This step is already implemented with Stripe
// Just need to integrate with enhanced order flow
<PaymentForm
  amount={totalAmount}
  onSuccess={(paymentIntent) => {
    // Create order in backend
    createOrder({
      ...orderState,
      paymentIntentId: paymentIntent.id,
    });
  }}
/>

// Confirmation Screen (after successful payment)
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  className="text-center"
>
  <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto" />
  <h2 className="text-2xl font-bold mt-4">Order Confirmed!</h2>
  <p className="text-gray-600 mt-2">Order #{orderNumber}</p>

  <div className="mt-8 space-y-4">
    <button className="btn-primary w-full" onClick={() => router.push(`/orders/${orderId}`)}>
      Track Order
    </button>
    <button className="btn-secondary w-full" onClick={() => router.push('/orders')}>
      View All Orders
    </button>
  </div>
</motion.div>
```

### 3.3 New Component Library

**Components to Build:**

1. **`<ServiceCard />`** - Service type selector with images
2. **`<FulfillmentModeSelector />`** - Visual fulfillment mode cards with pricing
3. **`<MerchantCard />`** - Rich merchant display (image, rating, distance, badges)
4. **`<ServiceCatalogItem />`** - Individual service in catalog with photo upload
5. **`<WardrobeItemGrid />`** - Grid of wardrobe items with multi-select
6. **`<AddressSelector />`** - Saved address quick-select dropdown
7. **`<AddressForm />`** - Address input with autocomplete (Google Places)
8. **`<TimeSlotPicker />`** - Visual time slot cards (not dropdown)
9. **`<PricingCalculator />`** - Live pricing with breakdown and animations
10. **`<TipSelector />`** - Tip percentage selector
11. **`<PromoCodeInput />`** - Promo code with validation
12. **`<OrderSummaryCard />`** - Collapsible order review with edit buttons

---

## Phase 4: Wardrobe Management System (2-3 days)

### 4.1 Wardrobe Page

**File:** `apps/web-customer/src/app/wardrobe/page.tsx`

```tsx
export default function WardrobePage() {
  const { data: wardrobeItems, isLoading } = trpc.wardrobe.getMyWardrobe.useQuery();
  const createItem = trpc.wardrobe.createItem.useMutation();
  const updateItem = trpc.wardrobe.updateItem.useMutation();
  const deleteItem = trpc.wardrobe.deleteItem.useMutation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Wardrobe</h1>
          <button onClick={() => setShowAddModal(true)}>
            + Add Item
          </button>
        </div>

        {/* Wardrobe Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {wardrobeItems?.map(item => (
            <WardrobeItemCard
              key={item.id}
              item={item}
              onEdit={() => editItem(item)}
              onDelete={() => deleteItem.mutate({ id: item.id })}
            />
          ))}
        </div>

        {/* Add/Edit Modal */}
        <WardrobeItemModal
          open={showAddModal}
          item={editingItem}
          onSave={async (data) => {
            if (data.id) {
              await updateItem.mutateAsync(data);
            } else {
              await createItem.mutateAsync(data);
            }
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      </div>
    </DashboardLayout>
  );
}
```

### 4.2 Wardrobe tRPC Router

**File:** `apps/web-customer/src/server/routers/wardrobe.ts`

```typescript
export const wardrobeRouter = router({
  getMyWardrobe: publicProcedure.query(async ({ ctx }) => {
    const customerId = DEMO_CUSTOMER_ID; // Replace with auth
    return api.get('/wardrobe', { params: { customerId } });
  }),

  createItem: publicProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        fabricType: z.string().optional(),
        color: z.string().optional(),
        brand: z.string().optional(),
        photoUrl: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return api.post('/wardrobe', {
        ...input,
        customerId: DEMO_CUSTOMER_ID,
      });
    }),

  updateItem: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        category: z.string().optional(),
        // ... other fields
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return api.patch(`/wardrobe/${id}`, data);
    }),

  deleteItem: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return api.delete(`/wardrobe/${input.id}`);
    }),
});
```

### 4.3 Backend Wardrobe Endpoints

**File:** `apps/api/src/modules/wardrobe/wardrobe.controller.ts` (new)

```typescript
@Controller('wardrobe')
export class WardrobeController {
  @Get()
  async getWardrobe(@Query('customerId') customerId: string) {
    return this.wardrobeService.findByCustomer(customerId);
  }

  @Post()
  async createItem(@Body() dto: CreateWardrobeItemDto) {
    return this.wardrobeService.create(dto);
  }

  @Patch(':id')
  async updateItem(@Param('id') id: string, @Body() dto: UpdateWardrobeItemDto) {
    return this.wardrobeService.update(id, dto);
  }

  @Delete(':id')
  async deleteItem(@Param('id') id: string) {
    return this.wardrobeService.delete(id);
  }
}
```

---

## Phase 5: Depot/Plant Governance (3-4 days)

### 5.1 Merchant Onboarding Enhancement

**File:** `apps/web-merchant/src/app/onboarding/business-type/page.tsx` (new)

```tsx
export default function BusinessTypeSelection() {
  const [businessType, setBusinessType] = useState<'DEPOT' | 'PLANT' | 'BOTH'>();
  const [disclosePlantPartners, setDisclosePlantPartners] = useState(false);
  const [requestExclusivity, setRequestExclusivity] = useState(false);
  const [exclusivityZone, setExclusivityZone] = useState<GeoJSON.Polygon>();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Tell us about your business</h1>

      {/* Business Type Selection */}
      <div className="space-y-4 mb-8">
        <label className="block font-medium">What type of business are you?</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BusinessTypeCard
            type="DEPOT"
            title="Retail Depot"
            description="I operate a drop-off location and partner with processing plants"
            selected={businessType === 'DEPOT'}
            onClick={() => setBusinessType('DEPOT')}
          />
          <BusinessTypeCard
            type="PLANT"
            title="Processing Plant"
            description="I have facilities to clean and process garments"
            selected={businessType === 'PLANT'}
            onClick={() => setBusinessType('PLANT')}
          />
          <BusinessTypeCard
            type="BOTH"
            title="Depot + Plant"
            description="I operate both retail locations and processing facilities"
            selected={businessType === 'BOTH'}
            onClick={() => setBusinessType('BOTH')}
          />
        </div>
      </div>

      {/* Depot-Specific Options */}
      {(businessType === 'DEPOT' || businessType === 'BOTH') && (
        <div className="space-y-6 border-t pt-6">
          <h2 className="text-xl font-semibold">Depot Settings</h2>

          {/* Plant Partnership Transparency */}
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={disclosePlantPartners}
              onChange={e => setDisclosePlantPartners(e.target.checked)}
            />
            <div>
              <span className="font-medium">Disclose plant partnerships to customers</span>
              <p className="text-sm text-gray-600">
                Let customers know which plants process their orders. This builds trust and transparency.
              </p>
            </div>
          </label>

          {/* Geographic Exclusivity */}
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={requestExclusivity}
              onChange={e => setRequestExclusivity(e.target.checked)}
            />
            <div>
              <span className="font-medium">Request geographic exclusivity</span>
              <p className="text-sm text-gray-600">
                Request exclusive service rights in your area. Your partner plants won't compete directly in your territory.
              </p>
            </div>
          </label>

          {requestExclusivity && (
            <div className="ml-8 mt-4">
              <label className="block font-medium mb-2">Define your service area</label>
              <MapPolygonDrawer
                onPolygonComplete={setExclusivityZone}
                initialCenter={merchantLocation}
              />
              <p className="text-sm text-gray-500 mt-2">
                Draw a polygon around your desired exclusive territory
              </p>
            </div>
          )}
        </div>
      )}

      {/* Plant-Specific Options */}
      {(businessType === 'PLANT' || businessType === 'BOTH') && (
        <div className="space-y-6 border-t pt-6">
          <h2 className="text-xl font-semibold">Plant Settings</h2>

          <div>
            <label className="block font-medium mb-2">Daily processing capacity</label>
            <input
              type="number"
              min={1}
              placeholder="e.g., 100 orders per day"
              className="w-full border rounded-lg p-3"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum number of orders you can process daily
            </p>
          </div>

          <div>
            <label className="block font-medium mb-2">Certifications</label>
            <FileUpload
              accept=".pdf,.jpg,.png"
              multiple
              label="Upload certification documents"
              hint="Eco-friendly, organic cleaning, etc."
            />
          </div>
        </div>
      )}

      <button className="btn-primary w-full mt-8" onClick={handleSubmit}>
        Continue
      </button>
    </div>
  );
}
```

### 5.2 Rating & Quality Governance

**Backend Service:**

```typescript
// apps/api/src/modules/merchants/merchant-quality.service.ts

@Injectable()
export class MerchantQualityService {
  constructor(private prisma: PrismaService) {}

  async checkRatingCompliance(merchantId: string): Promise<void> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (merchant.rating < merchant.minRatingRequired) {
      // Suspend merchant
      await this.prisma.merchant.update({
        where: { id: merchantId },
        data: {
          isActive: false,
          suspensionReason: `Rating ${merchant.rating} below minimum ${merchant.minRatingRequired}`,
          suspendedAt: new Date(),
        },
      });

      // Notify merchant
      await this.notificationService.send({
        to: merchant.userId,
        type: 'MERCHANT_SUSPENDED',
        message: 'Your account has been suspended due to low ratings. Please contact support.',
      });
    }
  }

  async updateRating(merchantId: string, newRating: number): Promise<void> {
    await this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        rating: newRating,
        ratingCount: { increment: 1 },
      },
    });

    // Check compliance after rating update
    await this.checkRatingCompliance(merchantId);
  }

  async scheduleRandomInspection(merchantId: string): Promise<void> {
    // Future: Schedule random quality inspections
    // For now, just log
    console.log(`Inspection scheduled for merchant ${merchantId}`);
  }
}
```

### 5.3 Commission Structure

**Pricing Service Enhancement:**

```typescript
// apps/api/src/modules/orders/pricing.service.ts

calculateMerchantCommission(order: Order, merchant: Merchant): number {
  let commissionRate = 0.15; // Base 15%

  // Depot using plant partnership: reduced commission
  if (merchant.isDepot) {
    const hasPlantPartnership = await this.checkPlantPartnership(merchant.id);
    if (hasPlantPartnership) {
      commissionRate = 0.10; // 10% for depots with plants
    }
  }

  // Tier-based adjustments
  switch (merchant.tier) {
    case 'BASIC':
      // Standard commission
      break;
    case 'PRO':
      // PRO gets 2% discount
      commissionRate -= 0.02;
      break;
    case 'ENTERPRISE':
      // Custom negotiated rate
      commissionRate = merchant.customCommissionRate || 0.12;
      break;
  }

  const commission = order.subtotal * commissionRate;
  return commission;
}
```

---

## Phase 6: Address Management (1-2 days)

### 6.1 Backend Address Endpoints

**Check if exists first:** `apps/api/src/modules/addresses/`

If not exists, create:

```typescript
// addresses.controller.ts
@Controller('addresses')
export class AddressesController {
  @Post()
  async create(@Body() dto: CreateAddressDto) {
    return this.addressesService.create(dto);
  }

  @Get()
  async findByCustomer(@Query('customerId') customerId: string) {
    return this.addressesService.findByCustomer(customerId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addressesService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.addressesService.delete(id);
  }
}

// addresses.service.ts
@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAddressDto) {
    return this.prisma.address.create({
      data: {
        ...dto,
        // Geocode address to get coordinates
        latitude: await this.geocodeLatitude(dto),
        longitude: await this.geocodeLongitude(dto),
      },
    });
  }

  async findByCustomer(customerId: string) {
    return this.prisma.address.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateAddressDto) {
    return this.prisma.address.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    return this.prisma.address.delete({ where: { id } });
  }

  private async geocodeLatitude(address: CreateAddressDto): Promise<number> {
    // Use Google Maps Geocoding API or similar
    // For now, return placeholder
    return 0;
  }

  private async geocodeLongitude(address: CreateAddressDto): Promise<number> {
    return 0;
  }
}
```

### 6.2 Frontend Address Book

**File:** `apps/web-customer/src/app/account/addresses/page.tsx`

```tsx
export default function AddressesPage() {
  const { data: addresses, isLoading } = trpc.addresses.getMyAddresses.useQuery();
  const createAddress = trpc.addresses.create.useMutation();
  const updateAddress = trpc.addresses.update.useMutation();
  const deleteAddress = trpc.addresses.delete.useMutation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Addresses</h1>
          <button onClick={() => setShowAddModal(true)}>
            + Add Address
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses?.map(address => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => editAddress(address)}
              onDelete={() => deleteAddress.mutate({ id: address.id })}
              onSetDefault={() => setDefaultAddress(address.id)}
            />
          ))}
        </div>

        <AddressModal
          open={showAddModal}
          address={editingAddress}
          onSave={async (data) => {
            if (data.id) {
              await updateAddress.mutateAsync(data);
            } else {
              await createAddress.mutateAsync(data);
            }
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      </div>
    </DashboardLayout>
  );
}
```

---

## Implementation Timeline

### Week 1: Foundation (Schema + Backend Routing)
**Days 1-2:** Schema changes (Phase 1)
- Extend MerchantType enum
- Add depot/plant fields to Merchant model
- Create DepotPlantPartnership model
- Create MerchantOrderDistribution model
- Run migration

**Days 3-5:** Backend merchant routing (Phase 2.1-2.2)
- Create MerchantRoutingService with algorithm
- Add merchant endpoints (nearby, availability, services, favorite)
- Test routing algorithm with mock data

### Week 2: Backend Order Enhancement + Addresses (Phase 2.3 + Phase 6)
**Days 1-3:** Enhance order creation
- Make merchantId optional in CreateOrderDto
- Integrate routing service into order creation
- Add capacity validation and tracking
- Update fair distribution counters

**Days 4-5:** Address management
- Create/verify address CRUD endpoints
- Add geocoding integration
- Test address creation and retrieval

### Week 3-4: Enhanced Order Flow UI (Phase 3)
**Week 3 Days 1-2:** Steps 1-2
- Build service type selector with real images
- Build fulfillment mode selector
- Build merchant selection UI with cards
- Integrate merchant API calls

**Week 3 Days 3-5:** Step 3
- Build service catalog with merchant integration
- Add photo upload for items
- Build wardrobe item selector (read-only for now)
- Build reorder from previous orders
- Create pricing calculator component

**Week 4 Days 1-2:** Steps 4-5
- Build address selector with saved addresses
- Add address creation inline
- Build time slot picker
- Add subscription toggle
- Build review & personalize screen

**Week 4 Days 3-5:** Step 6 + Polish
- Integrate payment (already built)
- Add confirmation screen
- Polish animations with Framer Motion
- Fix bugs and edge cases
- Responsive design testing

### Week 5: Wardrobe + Merchant Onboarding (Phase 4 + Phase 5.1)
**Days 1-3:** Wardrobe system
- Build wardrobe management page
- Create wardrobe tRPC router
- Build wardrobe backend endpoints
- Test wardrobe CRUD operations
- Integrate with order flow (Step 3)

**Days 4-5:** Merchant onboarding
- Build business type selection UI
- Add depot-specific settings
- Add plant-specific settings
- Add map polygon drawer for exclusivity zones

### Week 6: Governance + Testing (Phase 5.2-5.3 + Final Polish)
**Days 1-2:** Quality governance
- Implement rating compliance checks
- Add automatic suspension logic
- Build inspection scheduling (placeholder)

**Days 3-4:** Commission structure
- Implement tiered commission logic
- Test commission calculations
- Add merchant dashboard showing commission rates

**Day 5:** Final testing and deployment prep
- End-to-end testing of order flow
- Test depot/plant scenarios
- Fix critical bugs
- Documentation updates

---

## Success Metrics

### User Experience Metrics
- ✅ Order completion time reduced by 40%
- ✅ Mobile conversion rate increased
- ✅ Customer retention improved with "home store" feature
- ✅ Subscription adoption rate > 15%
- ✅ Wardrobe feature engagement > 30% of users

### Business Metrics
- ✅ Fair order distribution variance < 20%
- ✅ Merchant satisfaction score > 4.2/5
- ✅ Average merchant rating maintained > 4.5
- ✅ Depot retention rate > 80%
- ✅ Plant capacity utilization > 70%

### Technical Metrics
- ✅ Order creation API response time < 500ms
- ✅ Merchant routing algorithm < 200ms
- ✅ Zero data inconsistencies (addresses, orders)
- ✅ Mobile page load time < 3s

---

## Post-Enhancement: Feature Completion Roadmap

After completing the enhanced order flow, proceed with:

1. **Dashboard Enhancement** (80% → 100%)
   - Add order analytics charts
   - Add spending trends
   - Add loyalty points history

2. **Authentication Completion** (70% → 100%)
   - Replace DEMO_CUSTOMER_ID with real auth
   - Add OAuth providers (Google, Apple)
   - Add 2FA option

3. **Account Management** (0% → 100%)
   - Build account settings page
   - Add profile photo upload
   - Add payment methods management
   - Add notification preferences

4. **Service Pages** (0% → 100%)
   - Build /services/dry-cleaning page
   - Build /services/laundry page
   - Build /services/alterations page
   - Build /services/special-care page
   - Add service descriptions, pricing guides, FAQs

5. **AI Features Placeholder** (0% → 20%)
   - Add placeholder UI for fabric detection
   - Add placeholder UI for wardrobe recommendations
   - Document AI integration points for future ML work

---

## Risks & Mitigation

### Risk 1: Frontend-Backend API Mismatch Breaking Existing Orders
**Mitigation:**
- Maintain backward compatibility in backend
- Add feature flags for new order flow
- Run A/B test with 10% of users first

### Risk 2: Merchant Routing Algorithm Unfair Distribution
**Mitigation:**
- Extensive simulation testing before launch
- Monitor distribution metrics daily
- Adjust weights based on real data

### Risk 3: Depot-Plant Conflict Over Customers
**Mitigation:**
- Clear terms of service for both parties
- Mediation process for disputes
- Geographic exclusivity zones honored strictly
- Commission incentives aligned

### Risk 4: Performance Degradation with Complex Order Flow
**Mitigation:**
- Lazy load merchant data
- Cache service catalogs
- Optimize image loading (WebP, lazy loading)
- Add loading skeletons for better perceived performance

---

## Open Questions

1. **Geocoding Service:** Which provider should we use? (Google Maps, Mapbox, OpenStreetMap?)
2. **Image Storage:** Where should we store product/service/wardrobe images? (S3, Cloudinary, Vercel Blob?)
3. **Real-time Capacity:** Should we use WebSockets for real-time merchant capacity updates?
4. **AI Integration:** What's the timeline for actual ML-based fabric detection?
5. **Pricing Strategy:** Should we test different commission rates with merchants before hardcoding?

---

## Next Steps

When ready to proceed:
1. ✅ Review and approve this plan
2. 🔄 Create detailed implementation tasks in project management tool
3. 🔄 Set up feature branch: `feature/enhanced-order-flow`
4. 🔄 Begin Week 1 (Schema changes)
5. 🔄 Schedule weekly progress reviews

**Status:** Planning phase complete. Awaiting approval to begin implementation.
