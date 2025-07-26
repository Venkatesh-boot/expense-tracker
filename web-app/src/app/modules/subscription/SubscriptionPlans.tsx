import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { loadStripeJs } from './stripe';

const plans = [
  {
    name: 'Monthly',
    price: 99,
    period: 'month',
    features: [
      'Unlimited expense tracking',
      'Advanced analytics',
      'Priority support',
      'Export to CSV/PDF',
      'Multi-device sync',
    ],
    popular: false,
  },
  {
    name: 'Yearly',
    price: 999,
    period: 'year',
    features: [
      'All Monthly features',
      '2 months free',
      'Early access to new features',
    ],
    popular: true,
  },
];

export default function SubscriptionPlans() {
  const [loading, setLoading] = useState<string | null>(null);

  // Simulate backend call to create Stripe Checkout session
  async function handleSubscribe(planName: string) {
    setLoading(planName);
    // TODO: Replace with your backend endpoint
    // This is a placeholder for demo/testing only
    const response = await fetch('/api/create-stripe-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planName }),
    });
    const data = await response.json();
    const stripe = await loadStripeJs();
    await stripe.redirectToCheckout({ sessionId: data.sessionId });
    setLoading(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center py-8 px-2">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-700 dark:text-green-200">Choose Your Plan</h1>
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl justify-center">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 transition-all ${plan.popular ? 'border-blue-600 scale-105' : 'border-gray-200 dark:border-gray-700'}`}
            >
              {plan.popular && (
                <div className="mb-2 inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold">Most Popular</div>
              )}
              <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">{plan.name} Plan</h2>
              <div className="text-3xl font-extrabold text-blue-700 dark:text-green-200 mb-2">
                ₹{plan.price}
                <span className="text-base font-medium text-gray-500 dark:text-gray-300"> / {plan.period}</span>
              </div>
              <ul className="mb-4 text-gray-700 dark:text-gray-200 list-disc list-inside space-y-1">
                {plan.features.map(f => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition text-base disabled:opacity-60"
                onClick={() => handleSubscribe(plan.name)}
                disabled={loading === plan.name}
              >
                {loading === plan.name ? 'Redirecting...' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
