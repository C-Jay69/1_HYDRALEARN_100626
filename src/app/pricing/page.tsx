import Link from 'next/link';
import {
  Check,
  Gamepad2,
  ShieldCheck,
  Store,
  TrendingUp,
} from 'lucide-react';

import { AppLogo } from '@/components/app-logo';
import { PricingPlans } from './pricing-plans';
import { PricingFaq } from './pricing-faq';

const addOns = [
  {
    icon: ShieldCheck,
    name: 'Protect+ Module',
    price: '+$99 / month',
    tag: 'Wellness Suite',
    description:
      'AI Counselor for anonymous student support, bullying & safety reporting dashboard, and daily mood tracking with alerts.',
    budget: 'Funded from counseling & wellness budgets, not curriculum.',
  },
  {
    icon: TrendingUp,
    name: 'Analytics Pro',
    price: '+$49 / month',
    tag: 'Data & Insights',
    description:
      'Deep learning analytics, individual student progress tracking, predictive intervention alerts, and exportable IEP reports.',
    budget: 'Funded from assessment & data budgets, not curriculum.',
  },
];

const marketplace = [
  {
    title: 'Free to list',
    description: 'Anyone can create and publish a lesson pack. Zero barrier to entry.',
  },
  {
    title: '20% commission on sales',
    description:
      'We take 20%. For context, Teachers Pay Teachers takes 45% — competitive, and creators keep more.',
  },
  {
    title: 'Featured Listings ($5–15)',
    description: 'Boost visibility on a hot pack. Cheap, effective, and predictable.',
  },
  {
    title: 'Verified Creator Badge ($29/yr)',
    description: 'Build trust and unlock recurring revenue for your most active teachers.',
  },
];

const cosmetics = [
  'Custom Hydra Head avatars ($0.99–2.99)',
  'Classroom themes — space, underwater, retro arcade ($1.99)',
  'Sound effect packs for quizzes ($0.99)',
  'Seasonal bundles — Halloween Hydra, etc. ($4.99)',
];

const avoided = [
  'Ads in the learning experience',
  'Paywalling safety features',
  'Per-seat student pricing',
  'Locking basic pedagogy behind premium',
];

export const metadata = {
  title: 'Pricing - HydraLearn',
  description:
    'Honest, flexible pricing for teachers, departments, schools, and districts. Start free, upgrade when ready.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <AppLogo />
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#plans" className="transition-colors hover:text-foreground">
              Plans
            </a>
            <a href="#addons" className="transition-colors hover:text-foreground">
              Add-ons
            </a>
            <a href="#marketplace" className="transition-colors hover:text-foreground">
              Marketplace
            </a>
          </div>
          <Link
            href="/dashboard"
            className="gradient-bg rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg shadow-purple-500/25 transition-opacity hover:opacity-90"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <section className="pt-32 pb-12 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-semibold text-purple-300">
          Simple, honest pricing
        </span>
        <h1 className="mx-auto mb-4 max-w-3xl text-4xl font-black tracking-tight lg:text-6xl">
          Pay for what you <span className="gradient-text italic">use.</span> Never for what you need.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Start free, feel the magic, then upgrade when you&apos;re ready. Every plan
          saves schools time and money by putting AI to work in the classroom.
        </p>
      </section>

      <section id="plans" className="pb-24">
        <PricingPlans />
      </section>

      <section id="addons" className="border-t border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Premium Modules</h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Pick-and-choose upgrades that plug into your existing plan. Each draws
              from a different budget, so nothing gets bloated.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {addOns.map((addon) => (
              <div key={addon.name} className="rounded-2xl border border-border bg-card p-8">
                <div className="mb-4 flex items-center gap-3">
                  <span className="gradient-bg flex size-10 items-center justify-center rounded-lg">
                    <addon.icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-0.5 text-xs font-bold text-cyan-400">
                    {addon.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{addon.name}</h3>
                <p className="mt-1 text-lg font-black gradient-text">{addon.price}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {addon.description}
                </p>
                <p className="mt-4 inline-flex rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {addon.budget}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="marketplace" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <span className="gradient-bg flex size-12 items-center justify-center rounded-xl">
                <Store className="h-6 w-6" />
              </span>
            </div>
            <h2 className="mb-3 text-3xl font-bold">HydraHub Marketplace</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Teachers buy and sell lesson packs. It&apos;s the flywheel — the more
              content created, the more teachers join, the more content gets made.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {marketplace.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-2 font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="gradient-bg flex size-10 items-center justify-center rounded-lg">
                <Gamepad2 className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-bold">Cosmetic Fun Store</h2>
            </div>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              We never paywall learning. We only sell cosmetics: custom avatars and themes that make classrooms
              more fun. Paid by parents and schools as engagement boosters, never by kids.
            </p>
            <ul className="space-y-3 text-sm">
              {cosmetics.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-500" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold">What we&apos;ll never do</h2>
            <ul className="space-y-3 text-sm">
              {avoided.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-border bg-card p-4 text-muted-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-md text-sm text-muted-foreground">
              Pricing that respects teachers and keeps learning accessible is the whole point.
              If we can&apos;t make money that way, we don&apos;t deserve the money.
            </p>
          </div>
        </div>
      </section>

      <PricingFaq />

      <footer className="border-t border-border bg-card/40 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
          <AppLogo />
          <p className="text-sm text-muted-foreground">
            Many heads. One goal: smarter, safer learning.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/user-guide" className="transition-colors hover:text-foreground">
              User Guide
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} HydraLearn by LifeJacket AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}