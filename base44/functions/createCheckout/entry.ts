import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.14.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
        return Response.json({ error: 'Missing Stripe Secret Key' }, { status: 500 });
    }
    
    const stripe = new Stripe(stripeSecretKey);
    const appId = Deno.env.get("BASE44_APP_ID");

    const reqData = await req.json();
    const { priceId, type } = reqData;
    
    if (!priceId) {
        return Response.json({ error: 'Missing priceId' }, { status: 400 });
    }

    // Use referer as base URL to redirect back to
    const originUrl = req.headers.get('referer') || req.headers.get('origin');
    const baseUrl = originUrl ? new URL(originUrl).origin : 'https://' + req.headers.get('host');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: type === 'subscription' ? 'subscription' : 'payment',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${baseUrl}/settings?success=true`,
      cancel_url: `${baseUrl}/settings?canceled=true`,
      customer_email: user.email,
      metadata: {
        base44_app_id: appId,
        user_id: user.id,
        type: type // 'subscription' or 'chips'
      }
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});