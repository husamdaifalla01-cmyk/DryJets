'use client';

import { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements, AddressElement } from '@stripe/react-stripe-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api';
import { STRIPE_PRODUCTS } from '@/lib/stripe';

interface PaymentFormProps {
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

export default function PaymentForm({
  orderId,
  amount,
  orderItems = [],
  isSubscription = false,
  subscriptionId,
  savePaymentMethod = false,
  onSuccess,
  onError
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await paymentsApi.createIntent({
          orderId,
          amount,
          currency: 'usd',
          description: isSubscription ? `Subscription payment for order ${orderId}` : `Payment for order ${orderId}`,
          ...(isSubscription && subscriptionId && { subscriptionId }),
          ...(savePaymentMethod && { setupFutureUsage: 'off_session' })
        });

        setClientSecret(response.data.clientSecret);
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to create payment intent';
        setErrorMessage(message);
        onError(message);
      }
    };

    if (orderId && amount > 0) {
      createPaymentIntent();
    }
  }, [orderId, amount, isSubscription, subscriptionId, savePaymentMethod, onError]);

  const confirmPaymentMutation = useMutation({
    mutationFn: (data: { paymentIntentId: string; savePaymentMethod?: boolean }) =>
      paymentsApi.confirmPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      if (isSubscription) {
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      }
      onSuccess();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Payment confirmation failed';
      setErrorMessage(message);
      onError(message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Stripe has not loaded yet. Please try again.');
      return;
    }

    if (!clientSecret) {
      setErrorMessage('Payment setup is not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Submit payment to Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}?payment=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment with our backend
        await confirmPaymentMutation.mutateAsync({
          paymentIntentId: paymentIntent.id,
          savePaymentMethod
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
      onError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate itemized breakdown
  const getItemizedBreakdown = () => {
    const breakdown: Array<{ name: string; quantity: number; amount: number }> = [];

    orderItems.forEach(item => {
      const product = Object.values(STRIPE_PRODUCTS).find(p => p.priceId === item.priceId);
      if (product) {
        breakdown.push({
          name: product.name,
          quantity: item.quantity,
          amount: (product.unitAmount * item.quantity) / 100
        });
      }
    });

    return breakdown;
  };

  const itemizedBreakdown = getItemizedBreakdown();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      {itemizedBreakdown.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
          <div className="space-y-2">
            {itemizedBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>${item.amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-300 pt-2 mt-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${(amount / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Address */}
      {!isSubscription && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
          <AddressElement
            options={{
              mode: 'billing',
              allowedCountries: ['US', 'CA'], // Add more countries as needed
            }}
          />
        </div>
      )}

      {/* Payment Method */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">
          {isSubscription ? 'Payment Method (Saved for future billing)' : 'Payment Method'}
        </h3>

        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
            ...(savePaymentMethod && {
              setupFutureUsage: 'off_session'
            })
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Payment Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            ${(amount / 100).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            {isSubscription ? 'Due today (then monthly)' : 'Total amount'}
          </p>
        </div>

        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing || !clientSecret}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing...' : isSubscription ? 'Start Subscription' : 'Pay Now'}
        </button>
      </div>

      {/* Security Notice */}
      <div className="text-center space-y-2">
        <p className="text-xs text-gray-500">
          🔒 Your payment is secured by Stripe. We never store your card details.
        </p>
        {savePaymentMethod && (
          <p className="text-xs text-gray-500">
            💳 Your payment method will be saved for faster future payments.
          </p>
        )}
        {isSubscription && (
          <p className="text-xs text-gray-500">
            🔄 You can cancel your subscription at any time.
          </p>
        )}
      </div>
    </form>
  );
}
