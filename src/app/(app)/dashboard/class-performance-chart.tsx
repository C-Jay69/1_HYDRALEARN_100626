'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useI18n } from '@/components/i18n-provider';
import type { MessageKey } from '@/lib/i18n';

const chartData: { subjectKey: MessageKey; performance: number }[] = [
  { subjectKey: 'chart.algebra', performance: 82 },
  { subjectKey: 'chart.fractions', performance: 45 },
  { subjectKey: 'chart.geometry', performance: 76 },
  { subjectKey: 'chart.spelling', performance: 91 },
  { subjectKey: 'chart.reading', performance: 88 },
  { subjectKey: 'chart.writing', performance: 72 },
];

export function ClassPerformanceChart() {
  const { t } = useI18n();
  const data = chartData.map((item) => ({
    subject: t(item.subjectKey),
    performance: item.performance,
  }));

  return (
    <ChartContainer
      config={{
        performance: {
          label: t('chart.performance'),
          color: 'hsl(var(--primary))',
        },
      }}
      className="min-h-[250px] w-full"
    >
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="subject"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          domain={[0, 100]}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar
          dataKey="performance"
          fill="var(--color-performance)"
          radius={4}
        />
      </BarChart>
    </ChartContainer>
  );
}
