'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'Is the Free tier really free?',
    a: 'Yes. HydraLearn Lite costs $0 forever — 5 AI-generated lessons a month, a basic quiz generator, and community forum access. Materials come watermarked, which also means free marketing for us every time you share.',
  },
  {
    q: 'What counts as a "generation"?',
    a: 'One generation is one AI-produced deliverable: a lesson plan, an assessment, a set of differentiated activities, an essay grade, or a learning material. Regenerating the same item also counts.',
  },
  {
    q: 'Can I switch between monthly and annual billing?',
    a: 'Anytime. Annual billing saves you 20% and is charged once a year; monthly is billed every month. You can upgrade, downgrade, or cancel from your account settings.',
  },
  {
    q: 'Do School Licenses cover every teacher and student?',
    a: 'Yes — all seats are included. No per-seat student pricing, ever. Schools get the admin dashboard, wellness module, reporting, and SSO as part of the license.',
  },
  {
    q: 'What does the 20% marketplace commission mean for creators?',
    a: 'You keep 80% of every sale you make on HydraHub. Listing is free, and we take a 20% cut on sales — competitive with the 45% most marketplaces take. Featured listings ($5–15) and the Verified Creator badge ($29/yr) are optional boosts.',
  },
  {
    q: 'Do you ever paywall safety or wellness features?',
    a: 'No. The Protect suite — anonymous counseling, bullying reporting, mood tracking — is never locked behind a paywall. Optional Protect+ and Analytics Pro modules exist for schools that want deeper tools, but the baseline safety features stay accessible.',
  },
  {
    q: 'Who pays for the cosmetic store?',
    a: 'Parents and schools, not kids. Custom avatars, classroom themes, and sound packs are engagement boosters sold to parents and purchased in bulk by schools — learning content itself is never paywalled.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'For new customers, we offer a 14-day money-back guarantee on paid plans. Annual plans can be prorated back to monthly billing at any time if you decide to step down.',
  },
];

export function PricingFaq() {
  return (
    <section className="border-t border-border bg-secondary/30 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            The questions every skeptical teacher asks before they sign up.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q}>
              <AccordionTrigger className="text-base font-semibold">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}