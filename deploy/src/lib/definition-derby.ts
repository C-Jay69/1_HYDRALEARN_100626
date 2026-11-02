/**
 * Definition Derby — game engine.
 *
 * A Balderdash-style classroom gameshow: teams write believable fake answers
 * for a stimulus, the host mixes them with the real answer and reads them
 * aloud, then every team secretly votes for the answer it thinks is real.
 *
 * This module is pure (no React, no I/O) so the scoring rules are explicit
 * and easy to adjust.
 */

import {
  DERBY_CARDS,
  type CategoryFilter,
  type StimulusCard,
} from './definition-derby-data';

export type DerbyScoringMode = 'classic' | 'creative' | 'hybrid';

export interface DerbyTeam {
  id: string;
  name: string;
}

export interface DerbyConfig {
  rounds: number;
  category: CategoryFilter;
  /** Seconds each team gets to write. 0 means no timer. */
  writingSeconds: number;
  scoringMode: DerbyScoringMode;
}

export interface RoundOption {
  id: string;
  /** Display letter assigned after shuffling, e.g. "A". */
  letter: string;
  text: string;
  /** null means this option is the real answer. */
  authorTeamId: string | null;
}

export interface RoundVote {
  teamId: string;
  optionId: string;
}

export interface RoundScoreDetail {
  teamId: string;
  teamName: string;
  votedReal: boolean;
  votesReceived: number;
  points: number;
  reasons: string[];
}

export interface RoundScoreResult {
  scores: Record<string, number>;
  details: RoundScoreDetail[];
  topTeamIds: string[];
  realOptionId: string | null;
}

export type DerbyPhase =
  | 'setup'
  | 'handoff-write'
  | 'writing'
  | 'host-reveal'
  | 'handoff-vote'
  | 'voting'
  | 'results'
  | 'game-over';

export interface DerbyState {
  phase: DerbyPhase;
  config: DerbyConfig;
  teams: DerbyTeam[];
  /** 1-based round number for display. */
  round: number;
  /** Team order for writing and voting this round. */
  order: string[];
  orderIndex: number;
  drafts: { teamId: string; text: string }[];
  options: RoundOption[];
  votes: RoundVote[];
  roundScores: Record<string, number>;
  roundDetails: RoundScoreDetail[];
  totals: Record<string, number>;
  currentCard: StimulusCard | null;
  usedCardIds: string[];
}

export type DerbyAction =
  | { type: 'START_GAME'; config: DerbyConfig; teams: DerbyTeam[] }
  | { type: 'BEGIN_WRITING' }
  | { type: 'LOCK_IN_DEFINITION'; text: string }
  | { type: 'START_VOTING' }
  | { type: 'BEGIN_VOTING' }
  | { type: 'CAST_VOTE'; optionId: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'END_GAME' }
  | { type: 'RESET' };

export const DEFAULT_DERBY_CONFIG: DerbyConfig = {
  rounds: 5,
  category: 'All',
  writingSeconds: 60,
  scoringMode: 'classic',
};

export const DEFAULT_DERBY_TEAMS: DerbyTeam[] = [
  { id: 'team-a', name: 'Team A' },
  { id: 'team-b', name: 'Team B' },
  { id: 'team-c', name: 'Team C' },
  { id: 'team-d', name: 'Team D' },
];

/** Fisher–Yates shuffle (returns a copy). */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Draws a card for the round, avoiding repeats within a game. When the pool is
 * exhausted it starts over so long games never run dry.
 */
export function drawCard(
  category: CategoryFilter,
  usedIds: readonly string[]
): { card: StimulusCard; usedCardIds: string[] } {
  const pool = DERBY_CARDS.filter(
    (card) => category === 'All' || card.category === category
  );
  let available = pool.filter((card) => !usedIds.includes(card.id));
  let nextUsed = [...usedIds];

  if (available.length === 0) {
    nextUsed = [];
    available = pool;
  }

  const card = available[Math.floor(Math.random() * available.length)];
  return { card, usedCardIds: [...nextUsed, card.id] };
}

/**
 * Scores a round according to the three options in the game design document:
 *
 * - Classic:  +1 to each team that voted for the real answer, and +1 to the
 *             team(s) whose fake fooled the most voters.
 * - Creative: +1 to each team that voted for the real answer, and +2 to the
 *             team(s) whose fake fooled the most voters.
 * - Hybrid:   +1 to each team that voted for the real answer, and +2 to the
 *             single most-voted fake. A tie for most votes earns no bonus.
 */
export function scoreRound(
  teams: readonly DerbyTeam[],
  options: readonly RoundOption[],
  votes: readonly RoundVote[],
  mode: DerbyScoringMode
): RoundScoreResult {
  const realOption = options.find((option) => option.authorTeamId === null);
  const votesReceived: Record<string, number> = {};

  for (const option of options) {
    if (option.authorTeamId) votesReceived[option.authorTeamId] = 0;
  }
  for (const vote of votes) {
    const option = options.find((candidate) => candidate.id === vote.optionId);
    if (option?.authorTeamId) {
      votesReceived[option.authorTeamId] = (votesReceived[option.authorTeamId] ?? 0) + 1;
    }
  }

  const fakeVoteCounts = Object.values(votesReceived);
  const maxVotes = fakeVoteCounts.length > 0 ? Math.max(...fakeVoteCounts) : 0;
  const topTeamIds = teams
    .filter((team) => maxVotes > 0 && (votesReceived[team.id] ?? 0) === maxVotes)
    .map((team) => team.id);
  const singleTopTeamId = topTeamIds.length === 1 ? topTeamIds[0] : null;

  const scores: Record<string, number> = {};
  const details: RoundScoreDetail[] = [];

  for (const team of teams) {
    let points = 0;
    const reasons: string[] = [];
    const vote = votes.find((candidate) => candidate.teamId === team.id);
    const votedReal = Boolean(vote && realOption && vote.optionId === realOption.id);

    if (votedReal) {
      points += 1;
      reasons.push('Voted for the real answer (+1)');
    }

    const received = votesReceived[team.id] ?? 0;
    const isTop = maxVotes > 0 && received === maxVotes;

    if (mode === 'classic' && isTop) {
      points += 1;
      reasons.push(`Fooled the most voters — ${received} vote(s) (+1)`);
    }
    if (mode === 'creative' && isTop) {
      points += 2;
      reasons.push(`Fooled the most voters — ${received} vote(s) (+2)`);
    }
    if (mode === 'hybrid' && singleTopTeamId === team.id) {
      points += 2;
      reasons.push(`Had the single most-voted fake — ${received} vote(s) (+2)`);
    }
    if (mode === 'hybrid' && isTop && singleTopTeamId === null) {
      reasons.push(`Tied for most votes — ${received} vote(s), no bonus under Hybrid`);
    }
    if (received > 0 && !isTop) {
      reasons.push(`Their fake fooled ${received} team(s)`);
    }
    if (!votedReal) {
      reasons.push('Did not vote for the real answer');
    }

    scores[team.id] = points;
    details.push({
      teamId: team.id,
      teamName: team.name,
      votedReal,
      votesReceived: received,
      points,
      reasons,
    });
  }

  return {
    scores,
    details,
    topTeamIds,
    realOptionId: realOption?.id ?? null,
  };
}

export const INITIAL_DERBY_STATE: DerbyState = {
  phase: 'setup',
  config: DEFAULT_DERBY_CONFIG,
  teams: DEFAULT_DERBY_TEAMS,
  round: 1,
  order: [],
  orderIndex: 0,
  drafts: [],
  options: [],
  votes: [],
  roundScores: {},
  roundDetails: [],
  totals: Object.fromEntries(DEFAULT_DERBY_TEAMS.map((team) => [team.id, 0])),
  currentCard: null,
  usedCardIds: [],
};

function buildOptions(
  card: StimulusCard,
  drafts: readonly { teamId: string; text: string }[]
): RoundOption[] {
  const entries = [
    { id: 'real', text: card.realAnswer, authorTeamId: null as string | null },
    ...drafts.map((draft) => ({
      id: `fake-${draft.teamId}`,
      text: draft.text,
      authorTeamId: draft.teamId,
    })),
  ];

  return shuffle(entries).map((entry, index) => ({
    ...entry,
    letter: String.fromCharCode(65 + index),
  }));
}

function startGame(config: DerbyConfig, teams: DerbyTeam[]): DerbyState {
  const { card, usedCardIds } = drawCard(config.category, []);
  return {
    phase: 'handoff-write',
    config,
    teams,
    round: 1,
    order: teams.map((team) => team.id),
    orderIndex: 0,
    drafts: [],
    options: [],
    votes: [],
    roundScores: {},
    roundDetails: [],
    totals: Object.fromEntries(teams.map((team) => [team.id, 0])),
    currentCard: card,
    usedCardIds,
  };
}

export function derbyReducer(state: DerbyState, action: DerbyAction): DerbyState {
  switch (action.type) {
    case 'START_GAME': {
      const teams = action.teams.filter((team) => team.name.trim().length > 0);
      if (teams.length < 3) return state;
      return startGame(action.config, teams);
    }

    case 'BEGIN_WRITING':
      if (state.phase !== 'handoff-write') return state;
      return { ...state, phase: 'writing' };

    case 'LOCK_IN_DEFINITION': {
      if (state.phase !== 'writing') return state;
      const text = action.text.trim();
      if (text.length < 2) return state;
      const teamId = state.order[state.orderIndex];
      if (!teamId) return state;

      const drafts = [...state.drafts, { teamId, text }];
      const isLastTeam = state.orderIndex + 1 >= state.order.length;

      if (!isLastTeam) {
        return {
          ...state,
          drafts,
          orderIndex: state.orderIndex + 1,
          phase: 'handoff-write',
        };
      }

      const options = state.currentCard
        ? buildOptions(state.currentCard, drafts)
        : [];

      return { ...state, drafts, options, phase: 'host-reveal' };
    }

    case 'START_VOTING':
      if (state.phase !== 'host-reveal') return state;
      return {
        ...state,
        phase: 'handoff-vote',
        orderIndex: 0,
        votes: [],
        roundScores: {},
        roundDetails: [],
      };

    case 'BEGIN_VOTING':
      if (state.phase !== 'handoff-vote') return state;
      return { ...state, phase: 'voting' };

    case 'CAST_VOTE': {
      if (state.phase !== 'voting') return state;
      const teamId = state.order[state.orderIndex];
      if (!teamId) return state;
      const option = state.options.find((candidate) => candidate.id === action.optionId);
      if (!option) return state;
      // Teams may not vote for their own fake.
      if (option.authorTeamId === teamId) return state;

      const votes = [...state.votes, { teamId, optionId: option.id }];
      const isLastTeam = state.orderIndex + 1 >= state.order.length;

      if (!isLastTeam) {
        return { ...state, votes, orderIndex: state.orderIndex + 1, phase: 'handoff-vote' };
      }

      const result = scoreRound(state.teams, state.options, votes, state.config.scoringMode);
      const totals = { ...state.totals };
      for (const team of state.teams) {
        totals[team.id] = (totals[team.id] ?? 0) + (result.scores[team.id] ?? 0);
      }

      return {
        ...state,
        votes,
        roundScores: result.scores,
        roundDetails: result.details,
        totals,
        phase: 'results',
      };
    }

    case 'NEXT_ROUND': {
      if (state.phase !== 'results') return state;
      if (state.round >= state.config.rounds) {
        return { ...state, phase: 'game-over' };
      }

      const { card, usedCardIds } = drawCard(state.config.category, state.usedCardIds);
      // The team with the fewest total points starts the next round.
      const order = [...state.teams]
        .sort((a, b) => (state.totals[a.id] ?? 0) - (state.totals[b.id] ?? 0))
        .map((team) => team.id);

      return {
        ...state,
        phase: 'handoff-write',
        round: state.round + 1,
        order,
        orderIndex: 0,
        drafts: [],
        options: [],
        votes: [],
        roundScores: {},
        roundDetails: [],
        currentCard: card,
        usedCardIds,
      };
    }

    case 'PLAY_AGAIN':
      return startGame(state.config, state.teams);

    case 'END_GAME':
      if (state.phase === 'setup') return state;
      return { ...state, phase: 'game-over' };

    case 'RESET':
      return { ...state, phase: 'setup' };

    default:
      return state;
  }
}

export function sortedStandings(
  teams: readonly DerbyTeam[],
  totals: Record<string, number>
): { team: DerbyTeam; points: number }[] {
  return [...teams]
    .map((team) => ({ team, points: totals[team.id] ?? 0 }))
    .sort((a, b) => b.points - a.points);
}
