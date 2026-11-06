'use client';

import { useI18n } from '@/components/i18n-provider';
import type { MessageKey, TranslationVars } from '@/lib/i18n';

/**
 * Tiny client component so server components can render translated strings
 * without becoming client components themselves.
 */
export function T({
  k,
  vars,
}: {
  k: MessageKey;
  vars?: TranslationVars;
}) {
  const { t } = useI18n();
  return <>{t(k, vars)}</>;
}
