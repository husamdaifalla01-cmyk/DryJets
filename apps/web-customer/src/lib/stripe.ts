import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export { stripePromise };

// Product and Price IDs from Stripe
export const STRIPE_PRODUCTS = {
  WASH_FOLD: {
    id: 'prod_TN31ZeiwiPdfWI',
    priceId: 'price_1SQIvTPXiO6xSi5kJKmoDN93',
    name: 'Wash & Fold Service',
    unitAmount: 250, // $2.50 per lb
    description: 'Standard wash and fold laundry service - $2.50 per pound with minimum 10 lbs'
  },
  DRY_CLEANING_SHIRT: {
    id: 'prod_TN315idA3tfMad',
    priceId: 'price_1SQIvbPXiO6xSi5klSavPiji',
    name: 'Dry Cleaning - Shirts',
    unitAmount: 500, // $5.00 per shirt
    description: 'Professional dry cleaning service for shirts'
  },
  DRY_CLEANING_SUIT: {
    id: 'prod_TN31V1W8OlDv6X',
    priceId: 'price_1SQIvgPXiO6xSi5ky62gskor',
    name: 'Dry Cleaning - Suits',
    unitAmount: 1500, // $15.00 per suit
    description: 'Professional dry cleaning service for suits'
  },
  DRY_CLEANING_DRESS: {
    id: 'prod_TN31s5iR7AcFI1',
    priceId: 'price_1SQIvlPXiO6xSi5kv0I5J0CM',
    name: 'Dry Cleaning - Dresses',
    unitAmount: 1200, // $12.00 per dress
    description: 'Professional dry cleaning service for dresses'
  },
  SPECIALTY_WEDDING_DRESS: {
    id: 'prod_TN31MHb3uysJDZ',
    priceId: 'price_1SQIvpPXiO6xSi5kCTgLIbhH',
    name: 'Specialty Cleaning - Wedding Dress',
    unitAmount: 7500, // $75.00 per wedding dress
    description: 'Specialty cleaning service for wedding dresses'
  },
  SPECIALTY_LEATHER: {
    id: 'prod_TN31WuFgULSU0u',
    priceId: 'price_1SQIvtPXiO6xSi5kNco7EL1u',
    name: 'Specialty Cleaning - Leather Items',
    unitAmount: 4000, // $40.00 per leather item
    description: 'Specialty cleaning service for leather items'
  },
  SPECIALTY_COMFORTER: {
    id: 'prod_TN31fPcAV1gbPu',
    priceId: 'price_1SQIvxPXiO6xSi5kLwPIlv1P',
    name: 'Specialty Cleaning - Comforters',
    unitAmount: 2500, // $25.00 per comforter
    description: 'Specialty cleaning service for comforters'
  },
  DRIVER_DELIVERY: {
    id: 'prod_TN32j8jxdI5i2G',
    priceId: 'price_1SQIwMPXiO6xSi5kSiiZMrmQ',
    name: 'Driver Delivery Fee',
    unitAmount: 500, // $5.00 base delivery fee
    description: 'Driver delivery service fee - varies by distance'
  }
};

export const STRIPE_SUBSCRIPTIONS = {
  BASIC: {
    id: 'prod_TN32aPOIeOzrfb',
    priceId: 'price_1SQIw9PXiO6xSi5kifFxy31x',
    name: 'Laundry Subscription - Basic',
    amount: 2900, // $29.00/month
    freeLbs: 20,
    excessRate: 200 // $2.00/lb after free
  },
  PREMIUM: {
    id: 'prod_TN32XujSr8dKCG',
    priceId: 'price_1SQIwDPXiO6xSi5kfy2EkkZT',
    name: 'Laundry Subscription - Premium',
    amount: 7900, // $79.00/month
    freeLbs: 50,
    excessRate: 175 // $1.75/lb after free
  },
  BUSINESS: {
    id: 'prod_TN32lOTsnpPPT8',
    priceId: 'price_1SQIwHPXiO6xSi5kLquGkTn2',
    name: 'Laundry Subscription - Business',
    amount: 19900, // $199.00/month
    freeLbs: 150,
    excessRate: 150 // $1.50/lb after free
  }
};

// Utility functions for payment calculations
export const calculateWashFoldPrice = (pounds: number): number => {
  const minimumPounds = 10;
  const effectivePounds = Math.max(pounds, minimumPounds);
  return effectivePounds * STRIPE_PRODUCTS.WASH_FOLD.unitAmount;
};

export const calculateSubscriptionPrice = (
  subscriptionType: keyof typeof STRIPE_SUBSCRIPTIONS,
  additionalPounds: number
): number => {
  const sub = STRIPE_SUBSCRIPTIONS[subscriptionType];
  const excessPounds = Math.max(0, additionalPounds - sub.freeLbs);
  const excessCost = excessPounds * sub.excessRate;
  return sub.amount + excessCost;
};

export const calculateExpressMultiplier = (baseAmount: number): number => {
  return Math.round(baseAmount * 1.5); // 1.5x for express service
};
