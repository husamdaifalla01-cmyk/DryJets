// ============================================
// NOTIFICATION TYPES
// ============================================

export enum NotificationType {
  ORDER_CREATED = 'order:created',
  ORDER_CONFIRMED = 'order:confirmed',
  DRIVER_ASSIGNED = 'driver:assigned',
  DRIVER_ARRIVED_MERCHANT = 'driver:arrived-merchant',
  ORDER_READY = 'order:ready',
  DRIVER_EN_ROUTE = 'driver:on-way',
  DRIVER_ARRIVED_DELIVERY = 'driver:arrived-delivery',
  ORDER_COMPLETED = 'order:completed',
  PROMO_AVAILABLE = 'promo:available',
  SUBSCRIPTION_REMINDER = 'subscription:reminder',
  ORDER_CANCELLED = 'order:cancelled',
  REVIEW_REQUEST = 'review:request',
}

export interface PushNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  orderId?: string;
  driverId?: string;
  merchantId?: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface NotificationPreferences {
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

  quietHourStart?: string; // HH:mm format
  quietHourEnd?: string; // HH:mm format
  doNotDisturb: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  ordersEnabled: true,
  ordersSound: true,
  ordersVibration: true,

  driverEnabled: true,
  driverSound: true,
  driverVibration: true,

  promotionEnabled: true,
  promotionSound: false,
  promotionVibration: false,

  subscriptionEnabled: true,
  subscriptionSound: false,
  subscriptionVibration: false,

  quietHourStart: undefined,
  quietHourEnd: undefined,
  doNotDisturb: false,
};

export const notificationMessages: Record<NotificationType, { title: string; body: (data?: any) => string }> = {
  [NotificationType.ORDER_CREATED]: {
    title: 'Order Placed',
    body: () => 'Your order has been placed successfully',
  },
  [NotificationType.ORDER_CONFIRMED]: {
    title: 'Order Confirmed',
    body: (data) => `${data?.merchantName || 'Merchant'} confirmed your order`,
  },
  [NotificationType.DRIVER_ASSIGNED]: {
    title: 'Driver Assigned',
    body: (data) =>
      `${data?.driverName || 'Driver'} assigned (⭐${data?.rating || '4.5'})`,
  },
  [NotificationType.DRIVER_ARRIVED_MERCHANT]: {
    title: 'At Pickup Location',
    body: () => 'Your driver arrived at the merchant',
  },
  [NotificationType.ORDER_READY]: {
    title: 'Order Ready',
    body: () => 'Your order is ready for pickup',
  },
  [NotificationType.DRIVER_EN_ROUTE]: {
    title: 'On The Way',
    body: (data) =>
      `Driver is on the way (ETA: ${data?.eta || '15 min'})`,
  },
  [NotificationType.DRIVER_ARRIVED_DELIVERY]: {
    title: 'Driver Arrived',
    body: () => 'Your driver has arrived at your location',
  },
  [NotificationType.ORDER_COMPLETED]: {
    title: 'Delivery Completed',
    body: () => 'Your order has been delivered',
  },
  [NotificationType.PROMO_AVAILABLE]: {
    title: 'Special Offer',
    body: (data) =>
      `Get ${data?.discount || '20%'} off with code ${data?.code || 'SPECIAL'}`,
  },
  [NotificationType.SUBSCRIPTION_REMINDER]: {
    title: 'Recurring Order Due',
    body: (data) =>
      `Your ${data?.merchantName || 'merchant'} order is ready to schedule`,
  },
  [NotificationType.ORDER_CANCELLED]: {
    title: 'Order Cancelled',
    body: () => 'Your order has been cancelled',
  },
  [NotificationType.REVIEW_REQUEST]: {
    title: 'Share Your Feedback',
    body: () => 'Tell us about your recent order',
  },
};
