import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@13.10.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') as string,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
);

// Platform fee configuration
const PLATFORM_FEES = {
  MERCHANT_COMMISSION: 0.15, // 15% commission on all orders
  DRIVER_PLATFORM_FEE: 0.05, // 5% platform fee on driver earnings
  PROCESSING_FEE: 0.029, // 2.9% + $0.30 Stripe processing fee
};

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !endpointSecret) {
      return new Response('Webhook signature missing', { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    console.log('Processing webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;

      case 'payout.created':
      case 'payout.failed':
        await handlePayoutEvent(event.data.object as Stripe.Payout, event.type);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing payment intent succeeded:', paymentIntent.id);

  try {
    // Find the order by payment intent ID
    const { data: payment, error: paymentError } = await supabase
      .from('Payment')
      .select('*, order:orderId(*)')
      .eq('stripePaymentIntent', paymentIntent.id)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentIntent.id);
      return;
    }

    // Update payment status
    await supabase
      .from('Payment')
      .update({
        status: 'COMPLETED',
        stripeChargeId: paymentIntent.latest_charge as string,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', payment.id);

    // Update order status
    await supabase
      .from('Order')
      .update({
        status: 'CONFIRMED',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', payment.orderId);

    // Calculate and create transfers
    await processPayouts(payment, paymentIntent);

    console.log('Payment processing completed for:', paymentIntent.id);
  } catch (error) {
    console.error('Error processing payment intent:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing payment intent failed:', paymentIntent.id);

  try {
    // Update payment status to failed
    await supabase
      .from('Payment')
      .update({
        status: 'FAILED',
        updatedAt: new Date().toISOString(),
      })
      .eq('stripePaymentIntent', paymentIntent.id);

    // Update order status
    const { data: payment } = await supabase
      .from('Payment')
      .select('orderId')
      .eq('stripePaymentIntent', paymentIntent.id)
      .single();

    if (payment) {
      await supabase
        .from('Order')
        .update({
          status: 'PAYMENT_FAILED',
          updatedAt: new Date().toISOString(),
        })
        .eq('id', payment.orderId);
    }
  } catch (error) {
    console.error('Error processing payment failure:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing subscription created:', subscription.id);

  try {
    // Find customer by Stripe customer ID
    const { data: customer } = await supabase
      .from('Customer')
      .select('id, user:userId(*)')
      .eq('user.stripeCustomerId', subscription.customer as string)
      .single();

    if (!customer) {
      console.error('Customer not found for subscription:', subscription.id);
      return;
    }

    // Get subscription details from Stripe price
    const priceId = subscription.items.data[0]?.price.id;
    const planDetails = getPlanDetailsFromPriceId(priceId);

    // Create subscription record
    await supabase
      .from('Subscription')
      .insert({
        id: subscription.id, // Use Stripe subscription ID as primary key
        customerId: customer.id,
        merchantId: customer.user.merchantId || '', // Default merchant
        frequency: 'MONTHLY',
        status: 'ACTIVE',
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        planType: planDetails.type,
        amount: subscription.items.data[0]?.price.unit_amount || 0,
        freeLbsIncluded: planDetails.freeLbs,
        excessRate: planDetails.excessRate,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });

  } catch (error) {
    console.error('Error processing subscription creation:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id);

  try {
    const updateData: any = {
      status: subscription.status.toUpperCase(),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date().toISOString(),
    };

    if (subscription.canceled_at) {
      updateData.cancelledAt = new Date(subscription.canceled_at * 1000);
    }

    await supabase
      .from('Subscription')
      .update(updateData)
      .eq('stripeSubscriptionId', subscription.id);

  } catch (error) {
    console.error('Error processing subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deleted:', subscription.id);

  try {
    await supabase
      .from('Subscription')
      .update({
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq('stripeSubscriptionId', subscription.id);

  } catch (error) {
    console.error('Error processing subscription deletion:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing invoice payment succeeded:', invoice.id);

  // This handles subscription renewals
  if (invoice.subscription) {
    try {
      // Create a new order for the subscription billing
      const { data: subscription } = await supabase
        .from('Subscription')
        .select('*, customer:customerId(*)')
        .eq('stripeSubscriptionId', invoice.subscription as string)
        .single();

      if (subscription) {
        // This would typically create a recurring order for the subscription
        console.log('Subscription invoice paid:', invoice.id);
      }
    } catch (error) {
      console.error('Error processing subscription invoice:', error);
    }
  }
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  console.log('Processing transfer created:', transfer.id);

  try {
    // Update payment with transfer information
    if (transfer.metadata?.orderId) {
      const transferType = transfer.metadata.type === 'driver' ? 'stripeDriverTransferId' : 'stripeTransferId';

      await supabase
        .from('Payment')
        .update({
          [transferType]: transfer.id,
          updatedAt: new Date().toISOString(),
        })
        .eq('orderId', transfer.metadata.orderId);
    }
  } catch (error) {
    console.error('Error processing transfer:', error);
  }
}

async function handlePayoutEvent(payout: Stripe.Payout, eventType: string) {
  console.log(`Processing payout ${eventType}:`, payout.id);

  try {
    // Log payout events for accounting
    await supabase
      .from('AuditLog')
      .insert({
        action: eventType,
        entityType: 'PAYOUT',
        entityId: payout.id,
        details: {
          amount: payout.amount,
          currency: payout.currency,
          status: payout.status,
          destination: payout.destination,
        },
        createdAt: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Error processing payout event:', error);
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  console.log('Processing account updated:', account.id);

  try {
    // Update user account status
    await supabase
      .from('User')
      .update({
        stripeConnectStatus: account.charges_enabled ? 'ACTIVE' : 'RESTRICTED',
        updatedAt: new Date().toISOString(),
      })
      .eq('stripeConnectId', account.id);

  } catch (error) {
    console.error('Error processing account update:', error);
  }
}

async function processPayouts(payment: any, paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderTotal = payment.amount * 100; // Convert to cents

    // Calculate fees
    const platformFee = Math.round(orderTotal * PLATFORM_FEES.MERCHANT_COMMISSION);
    const stripeFee = Math.round((orderTotal * PLATFORM_FEES.PROCESSING_FEE) + 30); // $0.30 base fee
    const merchantAmount = orderTotal - platformFee - stripeFee;

    // Get merchant's Stripe Connect account
    const { data: merchant } = await supabase
      .from('Merchant')
      .select('user:userId(*)')
      .eq('id', payment.merchantId)
      .single();

    if (merchant?.user?.stripeConnectId) {
      // Create transfer to merchant
      const transfer = await stripe.transfers.create({
        amount: merchantAmount,
        currency: 'usd',
        destination: merchant.user.stripeConnectId,
        transfer_group: `ORDER_${payment.orderId}`,
        metadata: {
          orderId: payment.orderId,
          type: 'merchant',
        },
      });

      // Update payment with transfer info
      await supabase
        .from('Payment')
        .update({
          stripeTransferId: transfer.id,
          stripeFee: stripeFee / 100, // Convert back to dollars
          platformFee: platformFee / 100,
          merchantPayout: merchantAmount / 100,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', payment.id);
    }

    // Process driver payout if applicable
    const { data: order } = await supabase
      .from('Order')
      .select('driverId, deliveryFee')
      .eq('id', payment.orderId)
      .single();

    if (order?.driverId && order?.deliveryFee) {
      await processDriverPayout(order.driverId, order.deliveryFee, payment.orderId);
    }

  } catch (error) {
    console.error('Error processing payouts:', error);
  }
}

async function processDriverPayout(driverId: string, deliveryFee: number, orderId: string) {
  try {
    const deliveryFeeCents = deliveryFee * 100;
    const platformFee = Math.round(deliveryFeeCents * PLATFORM_FEES.DRIVER_PLATFORM_FEE);
    const stripeFee = Math.round((deliveryFeeCents * PLATFORM_FEES.PROCESSING_FEE) + 30);
    const driverAmount = deliveryFeeCents - platformFee - stripeFee;

    // Get driver's Stripe Connect account
    const { data: driver } = await supabase
      .from('Driver')
      .select('user:userId(*)')
      .eq('id', driverId)
      .single();

    if (driver?.user?.stripeConnectId) {
      // Create transfer to driver
      const transfer = await stripe.transfers.create({
        amount: driverAmount,
        currency: 'usd',
        destination: driver.user.stripeConnectId,
        transfer_group: `DELIVERY_${orderId}`,
        metadata: {
          orderId,
          type: 'driver',
        },
      });

      // Update payment with driver transfer info
      await supabase
        .from('Payment')
        .update({
          stripeDriverTransferId: transfer.id,
          driverPayout: driverAmount / 100,
          updatedAt: new Date().toISOString(),
        })
        .eq('orderId', orderId);
    }

  } catch (error) {
    console.error('Error processing driver payout:', error);
  }
}

function getPlanDetailsFromPriceId(priceId: string | undefined) {
  const plans = {
    'price_1SQIw9PXiO6xSi5kifFxy31x': { type: 'basic', freeLbs: 20, excessRate: 200 }, // $29/month
    'price_1SQIwDPXiO6xSi5kfy2EkkZT': { type: 'premium', freeLbs: 50, excessRate: 175 }, // $79/month
    'price_1SQIwHPXiO6xSi5kLquGkTn2': { type: 'business', freeLbs: 150, excessRate: 150 }, // $199/month
  };

  return plans[priceId as keyof typeof plans] || { type: 'basic', freeLbs: 20, excessRate: 200 };
}
