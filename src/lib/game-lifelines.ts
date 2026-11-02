/**
 * @fileOverview Game-show lifeline logic for HydraLearn.
 *
 * Implements the three classic quiz-show lifelines — 50:50, Phone a Friend and
 * Ask the Audience — as pure, deterministic functions so the same question
 * always produces the same hint/vote split across re-renders.
 *
 * Kept free of React so it can be unit-tested and reused by any game surface.
 */

import type { QuizQuestionSchema } from '@/ai/schemas/quiz-schema';
import type { z } from 'zod';

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

/** Game-show modes that support lifelines. */
export type GameShowType = 'game' | 'jeopardy' | 'millionaire' | 'weakest-link';

export type LifelineId = 'fiftyFifty' | 'phoneFriend' | 'askAudience';

export interface LifelineMeta {
  id: LifelineId;
  label: string;
  shortLabel: string;
  description: string;
}

export const LIFELINES: LifelineMeta[] = [
  {
    id: 'fiftyFifty',
    label: '50:50',
    shortLabel: '50:50',
    description: 'Removes two of the four wrong answers.',
  },
  {
    id: 'phoneFriend',
    label: 'Phone a Friend',
    shortLabel: 'Phone',
    description: 'A knowledgeable friend suggests the answer.',
  },
  {
    id: 'askAudience',
    label: 'Ask the Audience',
    shortLabel: 'Audience',
    description: 'The studio audience votes on each answer.',
  },
];

/** Which game shows get the lifeline bar. */
export const LIFELINE_GAME_TYPES: GameShowType[] = [
  'game',
  'jeopardy',
  'millionaire',
  'weakest-link',
];

export function supportsLifelines(gameType: GameShowType): boolean {
  return LIFELINE_GAME_TYPES.includes(gameType);
}

/* -------------------------------------------------------------------------- */
/* Deterministic pseudo-randomness                                            */
/* -------------------------------------------------------------------------- */

/** FNV-1a string hash — stable across runs and platforms. */
function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 PRNG — tiny, fast, and deterministic for a given seed. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Builds a stable seed from the question index and its text. */
export function seedFor(questionIndex: number, question: QuizQuestion): number {
  return hashString(`${questionIndex}:${question.question}:${question.answer}`);
}

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

/** Fisher-Yates shuffle driven by the supplied PRNG. */
function shuffle<T>(items: T[], rand: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/* -------------------------------------------------------------------------- */
/* Availability                                                               */
/* -------------------------------------------------------------------------- */

export interface LifelineAvailability {
  fiftyFifty: boolean;
  phoneFriend: boolean;
  askAudience: boolean;
}

/**
 * 50:50 needs at least four options to remove two.
 * Ask the Audience needs at least two options to split a vote between.
 * Phone a Friend works for every question type.
 */
export function lifelineAvailability(question: QuizQuestion): LifelineAvailability {
  const optionCount = question.options?.length ?? 0;
  return {
    fiftyFifty: optionCount >= 4,
    phoneFriend: true,
    askAudience: optionCount >= 2,
  };
}

/** Human-readable reason a lifeline is greyed out. */
export function unavailableReason(id: LifelineId, question: QuizQuestion): string {
  const optionCount = question.options?.length ?? 0;
  if (id === 'fiftyFifty') {
    return optionCount >= 4
      ? ''
      : '50:50 only applies to multiple-choice questions with four options.';
  }
  if (id === 'askAudience') {
    return optionCount >= 2
      ? ''
      : 'The audience needs multiple-choice options to vote on.';
  }
  return '';
}

/* -------------------------------------------------------------------------- */
/* 50:50                                                                      */
/* -------------------------------------------------------------------------- */

export interface FiftyFiftyResult {
  /** Options to grey out and disable. */
  eliminated: string[];
  /** Options that remain selectable. */
  remaining: string[];
}

/**
 * Removes roughly half the wrong options, always leaving the correct answer
 * and exactly one decoy in play for a standard four-option question.
 */
export function fiftyFifty(question: QuizQuestion, seed: number): FiftyFiftyResult {
  const options = question.options ?? [];
  if (options.length < 4) {
    return { eliminated: [], remaining: options };
  }

  const correct = normalise(question.answer);
  const wrongOptions = options.filter((option) => normalise(option) !== correct);

  // Four options -> keep 2. Larger sets -> keep half.
  const keepTotal = Math.max(2, Math.ceil(options.length / 2));
  const keepWrongCount = Math.max(1, keepTotal - 1);

  const rand = mulberry32(seed ^ 0x85ebca6b);
  const keptWrong = shuffle(wrongOptions, rand).slice(0, keepWrongCount);

  const eliminated = wrongOptions.filter((option) => !keptWrong.includes(option));
  const remaining = options.filter((option) => !eliminated.includes(option));

  return { eliminated, remaining };
}

/* -------------------------------------------------------------------------- */
/* Ask the Audience                                                           */
/* -------------------------------------------------------------------------- */

export interface AudienceVote {
  option: string;
  percent: number;
  isCorrect: boolean;
}

/**
 * Produces a plausible audience vote. The correct answer is favoured but not
 * always dominant — the audience is "usually right", like the real show.
 * Percentages always sum to 100.
 */
export function askAudience(question: QuizQuestion, seed: number): AudienceVote[] {
  const options = question.options ?? [];
  if (options.length < 2) return [];

  const rand = mulberry32(seed ^ 0x9e3779b9);
  const correct = normalise(question.answer);
  const correctIndex = options.findIndex((option) => normalise(option) === correct);

  // 45%–75% of the audience land on the right answer.
  const correctShare = 0.45 + rand() * 0.3;

  const shares = new Array<number>(options.length).fill(0);

  if (correctIndex === -1) {
    // Answer text isn't among the options — split the vote evenly.
    const even = 1 / options.length;
    shares.fill(even);
  } else {
    shares[correctIndex] = correctShare;
    const wrongIndexes = options.map((_, i) => i).filter((i) => i !== correctIndex);
    // Random weights so decoys don't split perfectly evenly.
    const weights = wrongIndexes.map(() => 0.35 + rand());
    const weightTotal = weights.reduce((sum, w) => sum + w, 0);
    wrongIndexes.forEach((optionIndex, i) => {
      shares[optionIndex] = ((1 - correctShare) * weights[i]) / weightTotal;
    });
  }

  const percents = shares.map((share) => Math.round(share * 100));
  // Correct any rounding drift so the total is exactly 100.
  const drift = 100 - percents.reduce((sum, p) => sum + p, 0);
  if (drift !== 0) {
    const target = percents.indexOf(Math.max(...percents));
    percents[target] += drift;
  }

  return options
    .map((option, index) => ({
      option,
      percent: percents[index],
      isCorrect: index === correctIndex,
    }))
    .sort((a, b) => b.percent - a.percent);
}

/* -------------------------------------------------------------------------- */
/* Phone a Friend                                                             */
/* -------------------------------------------------------------------------- */

export interface PhoneAFriendResult {
  /** The answer the friend suggests. */
  suggestion: string;
  /** The friend's reasoning. */
  reasoning: string;
  /** How sure the friend sounds, 0–100. */
  confidence: number;
}

/**
 * Builds the friend's response from the question's own explanation, so it is
 * instant and never costs an extra AI call. The friend is reliable but framed
 * as human judgement rather than certainty.
 */
export function phoneAFriend(question: QuizQuestion, seed: number): PhoneAFriendResult {
  const rand = mulberry32(seed ^ 0xc2b2ae35);
  const confidence = Math.round(70 + rand() * 25); // 70–95%

  const reasoning = question.explanation
    ? question.explanation.trim()
    : 'I remember covering this — trust me on it.';

  return {
    suggestion: question.answer,
    reasoning,
    confidence,
  };
}

/* -------------------------------------------------------------------------- */
/* Money ladder (Who Wants To Be A Millionaire)                               */
/* -------------------------------------------------------------------------- */

export const MILLIONAIRE_LADDER = [
  100, 200, 300, 500, 1_000,
  2_000, 4_000, 8_000, 16_000, 32_000,
  64_000, 125_000, 250_000, 500_000, 1_000_000,
];

/** 1-based question numbers after which winnings are guaranteed. */
export const MILLIONAIRE_SAFE_HAVENS: Record<number, number> = {
  5: 1_000,
  10: 32_000,
};

/** Dollar value shown for a question, preferring AI-supplied metadata. */
export function prizeFor(question: QuizQuestion, index: number): number {
  if (typeof question.value === 'number' && question.value > 0) {
    return question.value;
  }
  const tier = typeof question.tier === 'number' ? question.tier : index;
  return MILLIONAIRE_LADDER[Math.min(tier, MILLIONAIRE_LADDER.length - 1)];
}

/**
 * Amount banked after a wrong answer: the last safe haven already passed,
 * or zero before the first one.
 */
export function safeHavenFor(index: number): number {
  const questionNumber = index + 1;
  const passed = Object.keys(MILLIONAIRE_SAFE_HAVENS)
    .map(Number)
    .filter((n) => n <= questionNumber)
    .sort((a, b) => a - b);
  if (passed.length === 0) return 0;
  return MILLIONAIRE_SAFE_HAVENS[passed[passed.length - 1]];
}

/* -------------------------------------------------------------------------- */
/* Jeopardy points                                                            */
/* -------------------------------------------------------------------------- */

/** Jeopardy row value — 100 for row 1, 200 for row 2, and so on. */
export function jeopardyPointsFor(question: QuizQuestion, index: number): number {
  if (typeof question.value === 'number' && question.value > 0) {
    return question.value;
  }
  const tier = typeof question.tier === 'number' ? question.tier : index;
  // Assume a five-row board when the AI doesn't supply a tier.
  const row = Math.min(4, tier % 5);
  return (row + 1) * 100;
}

/* -------------------------------------------------------------------------- */
/* Weakest Link chain                                                         */
/* -------------------------------------------------------------------------- */

export const WEAKEST_LINK_MAX_CHAIN = 1_000;
export const WEAKEST_LINK_START_CHAIN = 100;

/** Doubles the chain value, capped like the real show. */
export function nextChain(currentChain: number): number {
  return Math.min(currentChain * 2, WEAKEST_LINK_MAX_CHAIN);
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}
