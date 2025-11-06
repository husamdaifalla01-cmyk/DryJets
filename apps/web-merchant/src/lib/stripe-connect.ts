/**
 * Stripe Connect Configuration for DryJets Platform
 *
 * Handles merchant and driver onboarding, payouts, and commission management
 */

// Platform fee configuration
export const PLATFORM_FEES = {
  MERCHANT_COMMISSION: 0.15, // 15% commission on all orders
  DRIVER_PLATFORM_FEE: 0.05, // 5% platform fee on driver earnings
  PROCESSING_FEE: 0.029, // 2.9% + $0.30 Stripe processing fee
};

// Stripe Connect account types
export enum ConnectAccountType {
  MERCHANT = 'merchant',
  DRIVER = 'driver'
}

// Onboarding URLs for different account types
export const getOnboardingUrl = (accountType: ConnectAccountType, accountId: string): string => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://dashboard.stripe.com'
    : 'https://dashboard.stripe.com/test';

  return `${baseUrl}/connect/accounts/${accountId}`;
};

// Express account creation configuration
export const getExpressAccountConfig = (accountType: ConnectAccountType, userData: any) => {
  const baseConfig = {
    type: 'express' as const,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: accountType === ConnectAccountType.MERCHANT ? 'company' : 'individual',
  };

  if (accountType === ConnectAccountType.MERCHANT) {
    return {
      ...baseConfig,
      company: {
        name: userData.businessName || userData.name,
        phone: userData.phone,
        tax_id: userData.taxId,
        address: {
          line1: userData.address?.line1,
          city: userData.address?.city,
          state: userData.address?.state,
          postal_code: userData.address?.postalCode,
          country: userData.address?.country || 'US',
        },
      },
      business_profile: {
        name: userData.businessName,
        product_description: 'Laundry and dry cleaning services',
        support_email: userData.email,
        support_phone: userData.phone,
        support_url: userData.website,
        url: userData.website,
      },
    };
  } else {
    // Driver configuration
    return {
      ...baseConfig,
      individual: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        dob: userData.dateOfBirth, // { day, month, year }
        address: {
          line1: userData.address?.line1,
          city: userData.address?.city,
          state: userData.address?.state,
          postal_code: userData.address?.postalCode,
          country: userData.address?.country || 'US',
        },
        ssn_last_4: userData.ssnLast4,
      },
      business_profile: {
        name: `${userData.firstName} ${userData.lastName}`,
        product_description: 'Delivery services for laundry and dry cleaning',
        support_email: userData.email,
        support_phone: userData.phone,
      },
    };
  }
};

// Payout calculation utilities
export const calculateMerchantPayout = (orderTotal: number): {
  merchantAmount: number;
  platformFee: number;
  stripeFee: number;
  netPayout: number;
} => {
  const platformFee = orderTotal * PLATFORM_FEES.MERCHANT_COMMISSION;
  const stripeFee = (orderTotal * PLATFORM_FEES.PROCESSING_FEE) + 30; // $0.30 base fee
  const merchantAmount = orderTotal - platformFee - stripeFee;

  return {
    merchantAmount,
    platformFee,
    stripeFee,
    netPayout: merchantAmount
  };
};

export const calculateDriverPayout = (deliveryFee: number): {
  driverAmount: number;
  platformFee: number;
  stripeFee: number;
  netPayout: number;
} => {
  const platformFee = deliveryFee * PLATFORM_FEES.DRIVER_PLATFORM_FEE;
  const stripeFee = (deliveryFee * PLATFORM_FEES.PROCESSING_FEE) + 30;
  const driverAmount = deliveryFee - platformFee - stripeFee;

  return {
    driverAmount,
    platformFee,
    stripeFee,
    netPayout: driverAmount
  };
};

// Account status utilities
export const getAccountStatus = (account: any): {
  status: 'pending' | 'restricted' | 'active' | 'incomplete';
  requirements: string[];
  canAcceptPayments: boolean;
} => {
  if (!account) {
    return { status: 'incomplete', requirements: ['Account not created'], canAcceptPayments: false };
  }

  const { charges_enabled, requirements } = account;

  if (!charges_enabled) {
    return {
      status: 'restricted',
      requirements: requirements?.currently_due || [],
      canAcceptPayments: false
    };
  }

  if (requirements?.currently_due?.length > 0) {
    return {
      status: 'incomplete',
      requirements: requirements.currently_due,
      canAcceptPayments: true // Can still accept payments but needs to complete requirements
    };
  }

  return {
    status: 'active',
    requirements: [],
    canAcceptPayments: true
  };
};

// Transfer creation utilities
export const createMerchantTransfer = async (
  orderId: string,
  merchantStripeAccountId: string,
  amount: number,
  description: string
) => {
  // This would be called from a Supabase Edge Function
  const transfer = {
    amount: Math.round(amount), // Convert to cents
    currency: 'usd',
    destination: merchantStripeAccountId,
    transfer_group: `ORDER_${orderId}`,
    metadata: {
      order_id: orderId,
      type: 'merchant_payout'
    },
    description
  };

  return transfer;
};

export const createDriverTransfer = async (
  deliveryId: string,
  driverStripeAccountId: string,
  amount: number,
  description: string
) => {
  // This would be called from a Supabase Edge Function
  const transfer = {
    amount: Math.round(amount), // Convert to cents
    currency: 'usd',
    destination: driverStripeAccountId,
    transfer_group: `DELIVERY_${deliveryId}`,
    metadata: {
      delivery_id: deliveryId,
      type: 'driver_payout'
    },
    description
  };

  return transfer;
};

// Dashboard URLs for account management
export const getExpressDashboardUrl = (accountId: string): string => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://dashboard.stripe.com'
    : 'https://dashboard.stripe.com/test';

  return `${baseUrl}/connect/accounts/${accountId}`;
};

// Webhook event types we need to handle
export const CONNECT_WEBHOOK_EVENTS = [
  'account.updated',
  'transfer.created',
  'transfer.failed',
  'payout.created',
  'payout.failed',
  'balance.available'
] as const;

export type ConnectWebhookEvent = typeof CONNECT_WEBHOOK_EVENTS[number];
