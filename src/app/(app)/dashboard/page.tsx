'use client';

import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { useI18n } from '@/components/i18n-provider';
import type { MessageKey } from '@/lib/i18n';
import { ClassPerformanceChart } from './class-performance-chart';

const studentsNeedingHelp: {
  name: string;
  subjectKey: MessageKey;
  issueKey: MessageKey;
  avatar: string;
  initials: string;
}[] = [
  {
    name: 'Johnny Appleseed',
    subjectKey: 'chart.fractions',
    issueKey: 'dashboard.student.divisionIssue',
    avatar: 'https://picsum.photos/seed/johnny/40/40',
    initials: 'JA',
  },
  {
    name: 'Maria Rodriguez',
    subjectKey: 'chart.writing',
    issueKey: 'dashboard.student.essayIssue',
    avatar: 'https://picsum.photos/seed/maria/40/40',
    initials: 'MR',
  },
  {
    name: 'Ahmed Khan',
    subjectKey: 'chart.geometry',
    issueKey: 'dashboard.student.proofsIssue',
    avatar: 'https://picsum.photos/seed/ahmed/40/40',
    initials: 'AK',
  },
];

export default function Dashboard() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        titleKey="dashboard.title"
        descriptionKey="dashboard.description"
        titleClassName="gradient-text"
      />
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase italic tracking-tight">
              {t('dashboard.studentsOnTrack')}
            </CardTitle>
            <span className="flex size-9 items-center justify-center rounded-lg gradient-bg">
              <BadgeCheck className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 / 22</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.sinceYesterday')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase italic tracking-tight">
              {t('dashboard.needsAttention')}
            </CardTitle>
            <span className="flex size-9 items-center justify-center rounded-lg gradient-bg">
              <AlertCircle className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.newMicroPlans')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase italic tracking-tight">
              {t('dashboard.lessonsPlanned')}
            </CardTitle>
            <span className="flex size-9 items-center justify-center rounded-lg gradient-bg">
              <BookOpen className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.thisWeek')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase italic tracking-tight">
              {t('dashboard.classEngagement')}
            </CardTitle>
            <span className="flex size-9 items-center justify-center rounded-lg gradient-bg">
              <Activity className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+92%</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.aboveAverage')}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="gradient-text">{t('dashboard.classPerformance')}</CardTitle>
            <CardDescription>
              {t('dashboard.classPerformanceDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClassPerformanceChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>{t('dashboard.studentsNeedingHelp')}</CardTitle>
              <CardDescription>
                {t('dashboard.microPlansAvailable')}
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1" variant="outline">
              <Link href="/schedule">
                {t('dashboard.viewSchedule')}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-8">
            {studentsNeedingHelp.map((student) => (
              <div className="flex items-center gap-4" key={student.name}>
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="person portrait"/>
                  <AvatarFallback>{student.initials}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    {student.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(student.subjectKey)}: {t(student.issueKey)}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  {t('dashboard.viewPlan')}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
