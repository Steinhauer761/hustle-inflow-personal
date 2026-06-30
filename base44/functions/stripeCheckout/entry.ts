import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const plan = body.plan || 'monthly'; // 'promo3mo' or 'monthly'

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-06-20',
    });

    const originUrl = req.headers.get('referer') || req.headers.get('origin');
    const appUrl = originUrl && originUrl !== 'null' ? new URL(originUrl).origin : 'https://app.hustleinflow.com';

    let lineItem;

    if (plan === 'fitness') {
      lineItem = {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Fitness & Performance Hub (Lifetime Access)',
            description: 'Lifetime unlock for the entire Fitness & Performance Hub',
          },
          unit_amount: 599, // $5.99 one-time
        },
        quantity: 1,
      };
    } else if (plan === 'visual_coach') {
      lineItem = {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Visual Coach Lifetime Add-on',
            description: 'Unlock personalized digital coaches, audio cues, and custom personas.',
          },
          unit_amount: 999, // $9.99 one-time
        },
        quantity: 1,
      };
    } else if (plan === 'bundle') {
      // HustleINFlow bundle: $15.99 first month then $4.99/mo
      lineItem = null; // We'll set line_items array directly below
    } else if (plan === 'chips_starter') {
      lineItem = {
        price_data: { currency: 'usd', product_data: { name: 'Starter Stack - 100,000 Chips' } , unit_amount: 199 },
        quantity: 1,
      };
    } else if (plan === 'chips_pro') {
      lineItem = {
        price_data: { currency: 'usd', product_data: { name: 'Pro Stack - 500,000 Chips' } , unit_amount: 499 },
        quantity: 1,
      };
    } else if (plan === 'chips_whale') {
      lineItem = {
        price_data: { currency: 'usd', product_data: { name: 'Vegas Whale - 1,000,000 Chips' } , unit_amount: 899 },
        quantity: 1,
      };
    } else {
      // Standard monthly subscription $4.99/mo
      lineItem = {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'HustleInFlow Premium — Monthly',
            description: 'Full access to the HustleINFlow ecosystem',
          },
          unit_amount: 499, // $4.99
          recurring: { interval: 'month' },
        },
        quantity: 1,
      };
    }

    const isFitness = plan === 'fitness';
    let successUrlPath = '/upgrade';
    if (isFitness) successUrlPath = '/fitness-upgrade';
    if (plan === 'visual_coach') successUrlPath = '/fitness/coach?success=true';
    if (plan.startsWith('chips_')) successUrlPath = '/casino';
    
    const lineItems = plan === 'bundle' ? [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'HustleInFlow Premium — Monthly',
            description: 'Full access to the HustleINFlow ecosystem',
          },
          unit_amount: 499,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Lifetime Fitness & Visual Coach Access',
            description: 'One-time setup fee for lifetime fitness and trainer access',
          },
          unit_amount: 1100, // 4.99 + 11.00 = 15.99 at checkout
        },
        quantity: 1,
      }
    ] : [lineItem];

    const isPaymentMode = ['fitness', 'visual_coach', 'chips_starter', 'chips_pro', 'chips_whale'].includes(plan);

    const sessionConfig = {
      payment_method_types: ['card'],
      mode: isPaymentMode ? 'payment' : 'subscription',
      line_items: lineItems,
      success_url: `${appUrl}${successUrlPath}?success=true&plan=${plan}`,
      cancel_url: `${appUrl}${successUrlPath}?cancelled=true`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        plan,
      },
    };

    // Try to get user email if logged in
    try {
      const user = await base44.auth.me();
      if (user?.email) sessionConfig.customer_email = user.email;
      if (user?.id) sessionConfig.metadata.user_id = user.id;
    } catch (_) {
      // Not logged in — that's fine, Stripe will ask for email
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log(`Checkout session created: ${session.id} | plan: ${plan}`);

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});