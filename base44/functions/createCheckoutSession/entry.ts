import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

// Server-side allowlist of approved Stripe price IDs.
// Only explicitly approved price IDs may be used to create a checkout session.
// To add a new plan, it must be added here with explicit approval.
const APPROVED_PRICE_IDS: ReadonlySet<string> = new Set([
  'price_premium_monthly',
]);

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, successUrl, cancelUrl } = await req.json();

    // Validate priceId against the server-side allowlist before proceeding.
    if (!priceId || !APPROVED_PRICE_IDS.has(priceId)) {
      return Response.json({ error: 'Invalid or unsupported price ID.' }, { status: 400 });
    }

    // Get or create subscription record
    const subscriptions = await base44.entities.Subscription.filter({ 
      created_by: user.email 
    });
    let subscription = subscriptions[0];

    // Create or retrieve Stripe customer
    let customerId = subscription?.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          app_id: Deno.env.get('BASE44_APP_ID')
        }
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_email: user.email,
      }
    });

    return Response.json({ 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});