import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';
import { PREMIUM_MONTHLY_PLAN, WEB_BILLING_ENABLED } from './subscriptionCatalog.js';

export function isWebBillingAvailable() {
  return WEB_BILLING_ENABLED && !Capacitor.isNativePlatform();
}

export async function startWebMonthlyCheckout() {
  if (!isWebBillingAvailable()) {
    throw new Error('WEB_BILLING_NOT_CONFIGURED');
  }

  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete('billing');
  const cancelUrl = currentUrl.toString();

  const successUrl = new URL(currentUrl.toString());
  successUrl.searchParams.set('billing', 'success');

  const response = await base44.functions.invoke('createCheckoutSession', {
    planId: PREMIUM_MONTHLY_PLAN.id,
    successUrl: successUrl.toString(),
    cancelUrl
  });
  const result = response?.data || response;
  const checkoutUrl = new URL(result?.url || '');

  if (checkoutUrl.protocol !== 'https:' || checkoutUrl.hostname !== 'checkout.stripe.com') {
    throw new Error('INVALID_CHECKOUT_URL');
  }

  window.location.assign(checkoutUrl.toString());
}
