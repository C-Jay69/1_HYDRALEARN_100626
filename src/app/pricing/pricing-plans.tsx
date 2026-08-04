'use client';

import { Check, Minus } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

type Billing = 'monthly' | 'annual';

interface Plan {
  name: string;
  tagline: string;
  monthly: number | null;
  annual: number | null;
  custom?: string;
  cta: string;
  featured?: boolean;
  features: { text: string; included: boolean }[];
}

const plans: Plan[] = [
  {
    name: 'HydraLearn Lite',
    tagline: 'The free hook. Feel the magic before you pay.',
    monthly: 0,
    annual: 0,
    cta: 'Start Free',
    features: [
      { text: '5 AI-generated lessons / month', included: true },
      { text: 'Basic quiz generator (no gamification)', included: true },
      { text: 'Community forum access', included: true },
      { text: 'Watermarked materials ("Made with HydraLearn")', included: true },
      { text: 'Unlimited generations', included: false },
      { text: 'Premium meme & humor packs', included: false },
      { text: 'Advanced analytics', included: false },
    ],
  },
  {
    name: 'Teacher Pro',
    tagline: 'For individual teachers who want it all.',
    monthly: 12,
    annual: 9.6,
    cta: 'Go Pro',
    featured: true,
    features: [
      { text: 'Unlimited AI generations', included: true },
      { text: 'All pedagogical models & gamification', included: true },
      { text: 'Remove watermarks', included: true },
      { text: 'Premium memes / humor packs', included: true },
      { text: 'Analytics & student progress tracking', included: true },
      { text: 'Community forum access', included: true },
      { text: 'Shared library & collaboration', included: false },
    ],
  },
  {
    name: 'Department',
    tagline: 'For 5–10 teachers who share everything.',
    monthly: 79,
    annual: 63.2,
    cta: 'Start Department',
    features: [
      { text: 'Everything in Teacher Pro', included: true },
      { text: 'Shared material library', included: true },
      { text: 'Collaboration tools', included: true },
      { text: 'Department-level analytics', included: true },
      { text: 'Priority support', included: true },
      { text: 'Admin dashboard', included: false },
      { text: 'Wellness & safety module', included: false },
    ],
  },
  {
    name: 'School License',
    tagline: 'For whole schools. All seats included.',
    monthly: 299,
    annual: 239.2,
    cta: 'Talk to Sales',
    features: [
      { text: 'Everything in Department', included: true },
      { text: 'Admin dashboard', included: true },
      { text: 'Student wellness module', included: true },
      { text: 'Reporting tools', included: true },
      { text: 'SSO integration', included: true },
      { text: 'Dedicated onboarding', included: true },
      { text: 'White-label & API access', included: false },
    ],
  },
];

function formatPrice(value: number | null): string {
  if (value === null) return 'Custom';
  return value === 0 ? '$0' : `$${value}`;
}

function priceSuffix(value: number | null, billing: Billing): string {
  if (value === null) return '';
  if (value === 0) return 'forever';
  return billing === 'monthly' ? '/month' : '/month, billed annually';
}

export function PricingPlans() {
  const [billing, setBilling] = useState<Billing>('monthly');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-12 flex items-center justify-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Monthly</span>
        <button
          type="button"
          role="switch"
          aria-checked={billing === 'annual'}
          aria-label="Toggle annual billing"
          onClick={() => setBilling((b) => (b === 'monthly' ? 'annual' : 'monthly'))}
          className={cn(
            'relative inline-flex h-7 w-14 items-center rounded-full transition-colors',
            billing === 'annual' ? 'gradient-bg' : 'bg-secondary'
          )}
        >
          <span
            className={cn(
              'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
              billing === 'annual' ? 'translate-x-8' : 'translate-x-1'
            )}
          />
        </button>
        <span className="text-sm font-medium text-muted-foreground">Annual</span>
        <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400">
          Save 20%
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {plans.map((plan) => {
          const price = billing === 'monthly' ? plan.monthly : plan.annual;
          return (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-card p-6 transition-all',
                plan.featured
                  ? 'border-transparent shadow-xl shadow-purple-500/20 ring-2 ring-purple-500'
                  : 'border-border'
              )}
            >
              {plan.featured && (
                <span className="gradient-bg absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wide">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="mt-1 min-h-10 text-sm text-muted-foreground">{plan.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight">
                  {formatPrice(price)}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {priceSuffix(price, billing)}
                </span>
              </div>
              <button
                type="button"
                className={cn(
                  'mt-5 w-full rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-90',
                  plan.featured ? 'gradient-bg shadow-lg shadow-purple-500/25' : 'border border-border'
                )}
              >
                {plan.cta}
              </button>
              <ul className="mt-6 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-500" />
                    ) : (
                      <Minus className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground/60 line-through'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-gradient-to-r from-purple-500/10 to-cyan-500/10 p-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <h3 className="text-xl font-bold">District Enterprise</h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              For districts and multi-school networks. White-label option, API access,
              dedicated support, training, and compliance documentation. From{' '}
              <span className="font-bold text-foreground">$5,000–15,000 / year</span>.
            </p>
          </div>
          <button
            type="button"
            className="gradient-bg rounded-xl px-6 py-3 text-sm font-bold shadow-lg shadow-purple-500/25 transition-opacity hover:opacity-90"
          >
            Contact Sales
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Prices in USD. Annual plans are billed once a year at 20% off. Cancel anytime.
      </p>
    </div>
  );
}