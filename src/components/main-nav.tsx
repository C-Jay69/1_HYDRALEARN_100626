'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  BookOpen,
  CalendarDays,
  Dna,
  Gamepad2,
  GraduationCap,
  Home,
  LifeBuoy,
  Sparkles,
  Users,
  Wand2,
  Brush,
  Shield,
  MessageCircle,
  Headphones,
  ClipboardCheck,
  HeartPulse,
  Library,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useI18n } from '@/components/i18n-provider';
import type { MessageKey } from '@/lib/i18n';

const links: { href: string; labelKey: MessageKey; icon: typeof Home }[] = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: Home },
  { href: '/lesson-planner', labelKey: 'nav.lessonPlanner', icon: BookOpen },
  { href: '/library', labelKey: 'nav.library', icon: Library },
  { href: '/assessment-generator', labelKey: 'nav.assessmentGen', icon: Sparkles },
  { href: '/studio', labelKey: 'nav.studio', icon: Brush },
  { href: '/differentiated-activities', labelKey: 'nav.differentiated', icon: Dna },
  { href: '/essay-grader', labelKey: 'nav.essayGrader', icon: GraduationCap },
  { href: '/batch-essay-grader', labelKey: 'nav.batchEssayGrader', icon: Users },
  { href: '/personalization', labelKey: 'nav.personalization', icon: Wand2 },
  { href: '/gamification', labelKey: 'nav.gamification', icon: Gamepad2 },
  { href: '/schedule', labelKey: 'nav.schedule', icon: CalendarDays },
  { href: '/protect/forum', labelKey: 'nav.forum', icon: MessageCircle },
  { href: '/protect/hydra-ear', labelKey: 'nav.hydraEar', icon: Headphones },
  { href: '/protect/safety-board', labelKey: 'nav.safetyBoard', icon: Shield },
  { href: '/protect/wellness', labelKey: 'nav.wellness', icon: HeartPulse },
  { href: '/user-guide', labelKey: 'nav.userGuide', icon: LifeBuoy },
];

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <SidebarMenu className={cn(className)}>
      {links.map((link) => {
        const label = t(link.labelKey);
        return (
          <SidebarMenuItem key={link.href}>
            <Link href={link.href}>
              <SidebarMenuButton isActive={pathname === link.href} tooltip={label}>
                <link.icon className="h-5 w-5" />
                <span>{label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
