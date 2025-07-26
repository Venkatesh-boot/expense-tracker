// Stripe utility for client-side checkout
// Replace with your real publishable key
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX';


declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window {
    Stripe?: any;
  }
}

export async function loadStripeJs() {
  if (!window.Stripe) {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.body.appendChild(script);
    await new Promise(resolve => {
      script.onload = resolve;
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window.Stripe as (key: string) => any)(STRIPE_PUBLISHABLE_KEY);
}
