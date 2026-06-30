import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.14.0';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!stripeSecretKey || !endpointSecret) {
    console.error('Missing Stripe secrets');
    return new Response('Configuration Error', { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  let event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'invoice.upcoming') {
    try {
      const base44 = createClientFromRequest(req);
      const invoice = event.data.object;
      
      let customerEmail = invoice.customer_email;
      if (!customerEmail && invoice.customer) {
        const customer = await stripe.customers.retrieve(invoice.customer);
        customerEmail = customer.email;
      }
      
      if (customerEmail) {
        const amount = (invoice.amount_due / 100).toFixed(2);
        const currency = invoice.currency.toUpperCase();
        const date = new Date(invoice.next_payment_attempt * 1000).toLocaleDateString();
        
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customerEmail,
          subject: '🔔 Upcoming Subscription Renewal - HustleINFlow',
          body: `Hi there,\n\nThis is a friendly reminder that your HustleINFlow subscription will renew soon.\n\nAmount: ${amount} ${currency}\nDate: ${date}\n\nThank you for being part of the HustleINFlow family!\n\nIf you have any questions, contact us at hustleinflow2026@gmail.com.\n\n— The HustleINFlow Team`,
          from_name: 'HustleINFlow',
        });
        console.log(`Upcoming invoice reminder sent to ${customerEmail}`);
      }
    } catch (e) {
       console.error("Error sending upcoming invoice reminder:", e);
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      const base44 = createClientFromRequest(req);
      
      if (session.metadata?.user_id) {
         const userId = session.metadata.user_id;
         
         const settingsList = await base44.asServiceRole.entities.UserSettings.filter({ created_by_id: userId });
         if (settingsList && settingsList.length > 0) {
           const userSettings = settingsList[0];
           
           if (session.metadata?.type === 'subscription' || session.metadata?.plan === 'monthly') {
              console.log(`Upgrading user ${userId} to premium`);
              await base44.asServiceRole.entities.UserSettings.update(userSettings.id, {
                  description: 'PREMIUM_MEMBER'
              });
           } else if (session.metadata?.plan === 'bundle') {
              console.log(`Unlocking bundle for user ${userId}`);
              await base44.asServiceRole.entities.UserSettings.update(userSettings.id, {
                  description: 'PREMIUM_MEMBER',
                  fitness_unlocked: true,
                  has_visual_coach: true
              });
           } else if (session.metadata?.plan === 'fitness') {
              console.log(`Unlocking fitness hub for user ${userId}`);
              await base44.asServiceRole.entities.UserSettings.update(userSettings.id, {
                  fitness_unlocked: true
              });
           } else if (session.metadata?.plan === 'visual_coach') {
              console.log(`Unlocking visual coach for user ${userId}`);
              await base44.asServiceRole.entities.UserSettings.update(userSettings.id, {
                  has_visual_coach: true
              });
           } else if (session.metadata?.plan?.startsWith('chips_')) {
              const plan = session.metadata.plan;
              let chipsToAdd = 0;
              if (plan === 'chips_starter') chipsToAdd = 100000;
              if (plan === 'chips_pro') chipsToAdd = 500000;
              if (plan === 'chips_whale') chipsToAdd = 1000000;
              
              console.log(`Adding ${chipsToAdd} chips for ${userId}`);
              await base44.asServiceRole.entities.UserSettings.update(userSettings.id, {
                  keno_balance: (userSettings.keno_balance || 0) + chipsToAdd,
                  main_balance: (userSettings.main_balance || 0) + chipsToAdd
              });
           }
         } else {
             console.log(`No user settings found for user ${userId}`);
         }
      } else {
          console.log(`No user_id found in metadata for session ${session.id}`);
      }
    } catch (e) {
       console.error("Error fulfilling purchase:", e);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});