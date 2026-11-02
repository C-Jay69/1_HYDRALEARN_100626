'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Percent, Phone, Users, PhoneCall } from 'lucide-react';
import {
  LIFELINES,
  type AudienceVote,
  type LifelineAvailability,
  type LifelineId,
  type PhoneAFriendResult,
  type QuizQuestion,
  unavailableReason,
} from '@/lib/game-lifelines';

const LIFELINE_ICONS: Record<LifelineId, typeof Percent> = {
  fiftyFifty: Percent,
  phoneFriend: Phone,
  askAudience: Users,
};

interface LifelineBarProps {
  question: QuizQuestion;
  availability: LifelineAvailability;
  used: Record<LifelineId, boolean>;
  /** Locked once the student has committed to an answer. */
  locked: boolean;
  onUse: (id: LifelineId) => void;
}

/**
 * The three classic quiz-show lifelines. Each may be used once per game and is
 * disabled when the current question can't support it (e.g. 50:50 on a
 * fill-in-the-blank) or once an answer has been submitted.
 */
export function LifelineBar({ question, availability, used, locked, onUse }: LifelineBarProps) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Lifelines
        </span>
        {LIFELINES.map((lifeline) => {
          const Icon = LIFELINE_ICONS[lifeline.id];
          const isUsed = used[lifeline.id];
          const isAvailable = availability[lifeline.id];
          const disabled = isUsed || !isAvailable || locked;

          const title = isUsed
            ? 'Already used this lifeline.'
            : !isAvailable
              ? unavailableReason(lifeline.id, question)
              : locked
                ? 'Lifelines are locked once you answer.'
                : lifeline.description;

          return (
            <Button
              key={lifeline.id}
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              title={title}
              onClick={() => onUse(lifeline.id)}
              className={cn(
                'gap-2',
                isUsed && 'line-through opacity-50',
                !isAvailable && 'opacity-40'
              )}
            >
              <Icon className="h-4 w-4" />
              {lifeline.shortLabel}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

interface AudienceResultProps {
  votes: AudienceVote[];
}

/** Displays the studio audience's split as labelled bars. */
export function AudienceResult({ votes }: AudienceResultProps) {
  if (votes.length === 0) return null;

  return (
    <div className="w-full rounded-lg border bg-muted/40 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">The audience says&hellip;</p>
      </div>
      {votes.map((vote) => (
        <div key={vote.option} className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className={cn('truncate', vote.isCorrect && 'font-semibold')}>
              {vote.option}
            </span>
            <span className="tabular-nums text-muted-foreground">{vote.percent}%</span>
          </div>
          <Progress
            value={vote.percent}
            className={cn('h-2', vote.isCorrect ? '[&>div]:bg-green-500' : '[&>div]:bg-primary/60')}
          />
        </div>
      ))}
    </div>
  );
}

interface PhoneAFriendResultProps {
  result: PhoneAFriendResult;
}

/** Displays the friend's suggested answer and reasoning. */
export function PhoneAFriendResultPanel({ result }: PhoneAFriendResultProps) {
  return (
    <div className="w-full rounded-lg border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/40">
      <div className="flex items-center gap-2">
        <PhoneCall className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          Your friend on the phone
        </p>
        <Badge variant="outline" className="ml-auto border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300">
          {result.confidence}% sure
        </Badge>
      </div>
      <p className="mt-2 text-sm text-blue-950 dark:text-blue-50">
        &ldquo;I&rsquo;m pretty sure it&rsquo;s{' '}
        <span className="font-semibold">{result.suggestion}</span>. {result.reasoning}&rdquo;
      </p>
    </div>
  );
}
