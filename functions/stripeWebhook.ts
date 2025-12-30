import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

// Numeric safety utilities
const safeTimestampToISO = (timestamp) => {
  if (!Number.isFinite(timestamp) || timestamp < 0 || !Number.isSafeInteger(timestamp)) {
    return new Date().toISOString();
  }
  const ms = timestamp * 1000;
  if (!Number.isSafeInteger(ms)) {
    return new Date().toISOString();
  }
  return new Date(ms).toISOString();
};

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return Response.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const base44 = createClientFromRequest(req);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_email || session.metadata?.user_email;

        if (customerEmail) {
          const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ 
            created_by: customerEmail 
          });

          const subscriptionData = {
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            plan_type: 'premium',
            status: 'active',
            current_period_start: new Date().toISOString(),
          };

          if (subscriptions.length > 0) {
            await base44.asServiceRole.entities.Subscription.update(
              subscriptions[0].id,
              subscriptionData
            );
          } else {
            await base44.asServiceRole.entities.Subscription.create({
              ...subscriptionData,
              created_by: customerEmail
            });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ 
          stripe_subscription_id: subscription.id 
        });

        if (subscriptions.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(
            subscriptions[0].id,
            {
              status: subscription.status === 'active' ? 'active' : 'cancelled',
              current_period_start: safeTimestampToISO(subscription.current_period_start),
              current_period_end: safeTimestampToISO(subscription.current_period_end),
            }
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ 
          stripe_subscription_id: subscription.id 
        });

        if (subscriptions.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(
            subscriptions[0].id,
            {
              status: 'cancelled',
              cancelled_at: new Date().toISOString()
            }
          );
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
});