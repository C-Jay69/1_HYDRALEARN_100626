import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Rocket,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { AppLogo } from '@/components/app-logo';

const pillars = [
  {
    icon: GraduationCap,
    title: 'Learn',
    accent: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
    chip: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    description:
      'Adaptive AI tutors that understand your pace. Mastery-based learning paths designed to keep students engaged and thriving.',
    points: [
      { text: '24/7 Personal AI Tutor', color: 'text-cyan-500' },
      { text: 'Interactive Study Quests', color: 'text-cyan-500' },
    ],
  },
  {
    icon: BookOpen,
    title: 'Manage',
    chip: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    hover: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
    description:
      'Empower teachers with AI grading assistants and real-time intervention dashboards. Spend more time teaching, less time tracking.',
    points: [
      { text: 'Auto-Grading & Feedback', color: 'text-purple-400' },
      { text: 'Class Health Analytics', color: 'text-purple-400' },
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Protect',
    chip: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    hover: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
    description:
      'Enterprise-grade data security and AI ethics frameworks. We ensure your institution\u2019s data remains private and compliant.',
    points: [
      { text: 'FERPA / GDPR Compliant', color: 'text-indigo-400' },
      { text: 'Ethical AI Safeguards', color: 'text-indigo-400' },
    ],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <AppLogo />
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#platform" className="transition-colors hover:text-foreground">
              Platform
            </a>
            <a href="#pillars" className="transition-colors hover:text-foreground">
              Solutions
            </a>
            <Link href="/user-guide" className="transition-colors hover:text-foreground">
              Resources
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="gradient-bg rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg shadow-purple-500/25 transition-opacity hover:opacity-90"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="grid-bg absolute inset-0 -z-10" />
        <div className="absolute -z-10 h-96 w-96 rounded-full bg-purple-500/25 blur-[128px]" />
        <div className="absolute -z-10 bottom-10 right-0 h-96 w-96 rounded-full bg-cyan-500/25 blur-[128px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-semibold text-purple-300">
              <Sparkles className="h-4 w-4" />
              AI-Powered Future of Learning
            </span>
            <h1 className="mb-8 text-5xl font-black leading-tight tracking-tight lg:text-7xl">
              Education
              <br />
              <span className="gradient-text italic">with Bite.</span>
            </h1>
            <p className="mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground lg:text-xl">
              Unleash the multi-headed power of AI in your classroom. Personalized
              learning for students, streamlined workflows for teachers, and deep
              insights for admins.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="gradient-bg rounded-xl px-8 py-4 text-center text-lg font-bold shadow-xl shadow-purple-500/25 transition-transform hover:scale-105"
              >
                Join the Forge
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-xl border border-border px-8 py-4 text-lg font-bold transition-colors hover:bg-secondary/60"
              >
                <Rocket className="h-5 w-5" />
                See how it works
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 scale-100 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-3xl" />
            <Image
              src="/logo.png"
              alt="HydraLearn"
              width={1366}
              height={768}
              className="animate-float relative mx-auto h-auto w-full max-w-md rounded-2xl object-contain shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      <section
        id="platform"
        className="border-y border-border bg-secondary/40 py-12 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Trusted by Educators Worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 transition-opacity hover:opacity-100">
            <span className="text-xl font-bold">University of Oxford</span>
            <span className="text-xl font-bold">MIT Edu</span>
            <span className="text-xl font-bold">Stanford Tech</span>
            <span className="text-xl font-bold">Global Schools</span>
          </div>
        </div>
      </section>

      <section id="pillars" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">A Triple-Headed Solution</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Powerful tools designed specifically for every stakeholder in the
              modern educational ecosystem.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className={`group rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-2xl ${pillar.hover}`}
              >
                <div className={`mb-6 inline-flex rounded-2xl border p-4 ${pillar.chip}`}>
                  <pillar.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">{pillar.title}</h3>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
                <ul className="space-y-3 text-sm font-medium">
                  {pillar.points.map((point) => (
                    <li key={point.text} className="flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${point.color}`} />
                      {point.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/40 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
          <AppLogo />
          <p className="text-sm text-muted-foreground">
            Many heads. One goal: smarter, safer learning.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/user-guide" className="transition-colors hover:text-foreground">
              User Guide
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/deployment-guide" className="transition-colors hover:text-foreground">
              Deployment
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