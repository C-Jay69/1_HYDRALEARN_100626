'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { useI18n } from '@/components/i18n-provider';
import type { MessageKey } from '@/lib/i18n';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  titleKey?: MessageKey;
  description?: string;
  descriptionKey?: MessageKey;
  titleClassName?: string;
  children?: ReactNode;
}

export function PageHeader({
  title,
  titleKey,
  description,
  descriptionKey,
  className,
  titleClassName,
  children,
  ...rest
}: PageHeaderProps) {
  const { t } = useI18n();
  const resolvedTitle = titleKey ? t(titleKey) : title;
  const resolvedDescription = descriptionKey ? t(descriptionKey) : description;

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8',
        className
      )}
      {...rest}
    >
      <div className="grid gap-1">
        <h1
          className={cn(
            'font-headline text-3xl md:text-4xl font-bold tracking-tight',
            titleClassName
          )}
        >
          {resolvedTitle}
        </h1>
        {resolvedDescription && (
          <p className="text-lg text-muted-foreground">{resolvedDescription}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
