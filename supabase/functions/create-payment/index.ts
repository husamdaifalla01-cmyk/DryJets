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
      orderId,
      amount,
      currency = 'usd',
      description,
      subscriptionId,
      savePaymentMethod = false
    } = requestData;

    if (!orderId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: orderId, amount' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the order belongs to the user
    const { data: order, error: orderError } = await supabase
      .from('Order')
      .select('*, customer:customerId(userId)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user owns this order
    if (order.customer.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId = order.customer.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${order.customer.firstName} ${order.customer.lastName}`,
        phone: user.phone || undefined,
        metadata: {
          supabaseUserId: user.id,
          customerId: order.customerId,
        },
      });

      stripeCustomerId = customer.id;

      // Update customer with Stripe ID
      await supabase
        .from('Customer')
        .update({ stripeCustomerId })
        .eq('id', order.customerId);
    }

    // Create payment intent
    const paymentIntentData: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: stripeCustomerId,
      metadata: {
        orderId,
        supabaseUserId: user.id,
        customerId: order.customerId,
      },
      description: description || `Payment for order ${orderId}`,
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // Add setup for future usage if requested
    if (savePaymentMethod) {
      paymentIntentData.setup_future_usage = 'off_session';
    }

    // Add subscription metadata if applicable
    if (subscriptionId) {
      paymentIntentData.metadata!.subscriptionId = subscriptionId;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    // Store payment intent in database
    const { error: paymentError } = await supabase
      .from('Payment')
      .insert({
        orderId,
        customerId: order.customerId,
        merchantId: order.merchantId,
        amount,
        currency: currency.toUpperCase(),
        paymentMethod: 'CARD', // Default to card
        stripePaymentIntent: paymentIntent.id,
        status: 'PENDING',
        merchantPayout: 0, // Will be calculated on success
        platformFee: 0, // Will be calculated on success
        driverPayout: 0, // Will be calculated on success
      });

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
