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

// Stripe price IDs for different plans
const PLAN_PRICES = {
  basic: 'price_1SQIw9PXiO6xSi5kifFxy31x', // $29/month
  premium: 'price_1SQIwDPXiO6xSi5kfy2EkkZT', // $79/month
  business: 'price_1SQIwHPXiO6xSi5kLquGkTn2', // $199/month
};

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const requestData = await req.json();
    const {
      action, // 'create', 'update', 'cancel'
      planType, // 'basic', 'premium', 'business'
      subscriptionId,
      merchantId,
    } = requestData;

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: action' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get customer data
    const { data: customer, error: customerError } = await supabase
      .from('Customer')
      .select('*')
      .eq('userId', user.id)
      .single();

    if (customerError || !customer) {
      return new Response(
        JSON.stringify({ error: 'Customer not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let stripeCustomerId = customer.stripeCustomerId;

    // Create Stripe customer if not exists
    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: `${customer.firstName} ${customer.lastName}`,
        phone: user.phone || undefined,
        metadata: {
          supabaseUserId: user.id,
          customerId: customer.id,
        },
      });

      stripeCustomerId = stripeCustomer.id;

      // Update customer with Stripe ID
      await supabase
        .from('Customer')
        .update({ stripeCustomerId })
        .eq('id', customer.id);
    }

    let result;

    switch (action) {
      case 'create':
        result = await createSubscription(customer, planType, merchantId || '');
        break;

      case 'update':
        result = await updateSubscription(subscriptionId, planType);
        break;

      case 'cancel':
        result = await cancelSubscription(subscriptionId);
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Subscription management error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function createSubscription(customer: any, planType: string, merchantId: string) {
  const priceId = PLAN_PRICES[planType as keyof typeof PLAN_PRICES];

  if (!priceId) {
    throw new Error('Invalid plan type');
  }

  // Create Stripe subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.stripeCustomerId,
    items: [{
      price: priceId,
    }],
    metadata: {
      supabaseCustomerId: customer.id,
      merchantId,
      planType,
    },
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });

  // Get plan details
  const planDetails = getPlanDetails(planType);

  // Create subscription record in database
  const { data: dbSubscription, error } = await supabase
    .from('Subscription')
    .insert({
      id: subscription.id, // Use Stripe subscription ID
      customerId: customer.id,
      merchantId,
      frequency: 'MONTHLY',
      status: 'ACTIVE',
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      planType,
      amount: planDetails.amount,
      freeLbsIncluded: planDetails.freeLbs,
      excessRate: planDetails.excessRate,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating subscription record:', error);
    throw error;
  }

  return {
    subscription: dbSubscription,
    clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
  };
}

async function updateSubscription(subscriptionId: string, newPlanType: string) {
  const newPriceId = PLAN_PRICES[newPlanType as keyof typeof PLAN_PRICES];

  if (!newPriceId) {
    throw new Error('Invalid plan type');
  }

  // Get current subscription
  const { data: subscription, error: subError } = await supabase
    .from('Subscription')
    .select('*')
    .eq('stripeSubscriptionId', subscriptionId)
    .single();

  if (subError || !subscription) {
    throw new Error('Subscription not found');
  }

  // Update Stripe subscription
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.stripeSubscriptionId, // This is actually the subscription item ID
      price: newPriceId,
    }],
    proration_behavior: 'create_prorations',
  });

  // Get new plan details
  const planDetails = getPlanDetails(newPlanType);

  // Update database
  await supabase
    .from('Subscription')
    .update({
      stripePriceId: newPriceId,
      planType: newPlanType,
      amount: planDetails.amount,
      freeLbsIncluded: planDetails.freeLbs,
      excessRate: planDetails.excessRate,
      updatedAt: new Date().toISOString(),
    })
    .eq('stripeSubscriptionId', subscriptionId);

  return { success: true, subscription: updatedSubscription };
}

async function cancelSubscription(subscriptionId: string) {
  // Cancel at period end to avoid immediate charge
  const cancelledSubscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  // Update database
  await supabase
    .from('Subscription')
    .update({
      cancelAtPeriodEnd: true,
      updatedAt: new Date().toISOString(),
    })
    .eq('stripeSubscriptionId', subscriptionId);

  return { success: true, subscription: cancelledSubscription };
}

function getPlanDetails(planType: string) {
  const plans = {
    basic: { amount: 2900, freeLbs: 20, excessRate: 200 }, // $29/month
    premium: { amount: 7900, freeLbs: 50, excessRate: 175 }, // $79/month
    business: { amount: 19900, freeLbs: 150, excessRate: 150 }, // $199/month
  };

  return plans[planType as keyof typeof plans] || plans.basic;
}
