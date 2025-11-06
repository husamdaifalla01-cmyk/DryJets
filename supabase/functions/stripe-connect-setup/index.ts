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
      accountType, // 'merchant' or 'driver'
      businessData, // Business information for merchants
      personalData, // Personal information for drivers
      refreshUrl = `${Deno.env.get('APP_URL')}/dashboard/settings`,
      returnUrl = `${Deno.env.get('APP_URL')}/dashboard/payouts`,
    } = requestData;

    if (!accountType || !['merchant', 'driver'].includes(accountType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid account type. Must be "merchant" or "driver"' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has a Stripe Connect account
    const { data: existingUser } = await supabase
      .from('User')
      .select('stripeConnectId, stripeConnectStatus')
      .eq('id', user.id)
      .single();

    if (existingUser?.stripeConnectId) {
      // Return existing account onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: existingUser.stripeConnectId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return new Response(
        JSON.stringify({
          url: accountLink.url,
          accountId: existingUser.stripeConnectId,
          status: existingUser.stripeConnectStatus,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Create new Express account
    const accountData = createAccountData(accountType, user, businessData, personalData);

    const account = await stripe.accounts.create({
      ...accountData,
      metadata: {
        supabaseUserId: user.id,
        accountType,
      },
    });

    // Update user with Stripe Connect ID
    await supabase
      .from('User')
      .update({
        stripeConnectId: account.id,
        stripeConnectStatus: 'PENDING',
      })
      .eq('id', user.id);

    // Create account onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return new Response(
      JSON.stringify({
        url: accountLink.url,
        accountId: account.id,
        status: 'PENDING',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Stripe Connect setup error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function createAccountData(
  accountType: string,
  user: any,
  businessData?: any,
  personalData?: any
) {
  const baseData = {
    type: 'express' as const,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: accountType === 'merchant' ? 'company' : 'individual',
    email: user.email,
  };

  if (accountType === 'merchant') {
    return {
      ...baseData,
      company: {
        name: businessData?.businessName || `${user.user_metadata?.firstName} ${user.user_metadata?.lastName}`,
        phone: user.phone || businessData?.phone,
        tax_id: businessData?.taxId,
        address: {
          line1: businessData?.address?.line1,
          city: businessData?.address?.city,
          state: businessData?.address?.state,
          postal_code: businessData?.address?.postalCode,
          country: businessData?.address?.country || 'US',
        },
      },
      business_profile: {
        name: businessData?.businessName || 'Laundry Service',
        product_description: 'Professional laundry and dry cleaning services',
        support_email: user.email,
        support_phone: user.phone || businessData?.phone,
        support_url: businessData?.website,
        url: businessData?.website,
      },
    };
  } else {
    // Driver account
    return {
      ...baseData,
      individual: {
        first_name: personalData?.firstName || user.user_metadata?.firstName,
        last_name: personalData?.lastName || user.user_metadata?.lastName,
        email: user.email,
        phone: user.phone || personalData?.phone,
        dob: personalData?.dateOfBirth ? {
          day: personalData.dateOfBirth.day,
          month: personalData.dateOfBirth.month,
          year: personalData.dateOfBirth.year,
        } : undefined,
        address: {
          line1: personalData?.address?.line1,
          city: personalData?.address?.city,
          state: personalData?.address?.state,
          postal_code: personalData?.address?.postalCode,
          country: personalData?.address?.country || 'US',
        },
        ssn_last_4: personalData?.ssnLast4,
      },
      business_profile: {
        name: `${personalData?.firstName || user.user_metadata?.firstName} ${personalData?.lastName || user.user_metadata?.lastName}`,
        product_description: 'Delivery services for laundry and dry cleaning',
        support_email: user.email,
        support_phone: user.phone || personalData?.phone,
      },
    };
  }
}
