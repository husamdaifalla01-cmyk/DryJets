'use client';

import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import PaymentForm from './PaymentForm';

interface StripeProviderProps {
  orderId: string;
  amount: number;
  orderItems?: Array<{
    type: string;
    quantity: number;
    priceId: string;
  }>;
  isSubscription?: boolean;
  subscriptionId?: string;
  savePaymentMethod?: boolean;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function StripeProvider(props: StripeProviderProps) {
  const options = {
    // passing the client secret obtained from the server
    clientSecret: '', // This will be set by the PaymentForm component
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0A78FF', // DryJets blue
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} />
    </Elements>
  );
}
