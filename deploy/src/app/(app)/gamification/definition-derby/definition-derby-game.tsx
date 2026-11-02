'use client';

import { useEffect, useReducer, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Crown,
  Eye,
  EyeOff,
  Gamepad2,
  Lightbulb,
  Lock,
  PenLine,
  Play,
  RotateCcw,
  Shuffle,
  Timer,
  Trophy,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  DERBY_CATEGORIES,
  type CategoryFilter,
  type StimulusCard,
} from '@/lib/definition-derby-data';
import {
  INITIAL_DERBY_STATE,
  derbyReducer,
  sortedStandings,
  type DerbyConfig,
  type DerbyScoringMode,
  type DerbyTeam,
  type RoundOption,
  type RoundScoreDetail,
  type RoundVote,
} from '@/lib/definition-derby';

const SCORING_MODES: {
  value: DerbyScoringMode;
  title: string;
  description: string;
}[] = [
  {
    value: 'classic',
    title: 'Classic',
    description:
      '+1 for voting for the real answer. +1 to the team whose fake fooled the most voters.',
  },
  {
    value: 'creative',
    title: 'Creative',
    description:
      '+1 for voting for the real answer. +2 to the team whose fake fooled the most voters.',
  },
  {
    value: 'hybrid',
    title: 'Hybrid',
    description:
      '+1 for voting for the real answer. +2 to the single most-voted fake — ties earn no bonus.',
  },
];

function teamLetterName(teams: readonly DerbyTeam[]): string {
  const used = new Set(teams.map((team) => team.name.trim().toLowerCase()));
  for (let i = 0; i < 26; i += 1) {
    const candidate = `Team ${String.fromCharCode(65 + i)}`;
    if (!used.has(candidate.toLowerCase())) return candidate;
  }
  return `Team ${teams.length + 1}`;
}

export function DefinitionDerbyGame() {
  const [state, dispatch] = useReducer(derbyReducer, INITIAL_DERBY_STATE);

  switch (state.phase) {
    case 'setup':
      return (
        <SetupScreen
          initialConfig={state.config}
          initialTeams={state.teams}
          onStart={(config, teams) =>
            dispatch({ type: 'START_GAME', config, teams })
          }
        />
      );

    case 'handoff-write': {
      const team = state.teams.find(
        (candidate) => candidate.id === state.order[state.orderIndex]
      );
      if (!state.currentCard || !team) return null;
      return (
        <HandoffWriteScreen
          round={state.round}
          totalRounds={state.config.rounds}
          card={state.currentCard}
          teamName={team.name}
          isFirstTeam={state.orderIndex === 0}
          onBegin={() => dispatch({ type: 'BEGIN_WRITING' })}
        />
      );
    }

    case 'writing': {
      const team = state.teams.find(
        (candidate) => candidate.id === state.order[state.orderIndex]
      );
      if (!state.currentCard || !team) return null;
      return (
        <WritingScreen
          key={`write-${state.round}-${state.orderIndex}`}
          round={state.round}
          totalRounds={state.config.rounds}
          card={state.currentCard}
          teamName={team.name}
          writingSeconds={state.config.writingSeconds}
          onLockIn={(text) => dispatch({ type: 'LOCK_IN_DEFINITION', text })}
        />
      );
    }

    case 'host-reveal':
      if (!state.currentCard) return null;
      return (
        <HostRevealScreen
          round={state.round}
          totalRounds={state.config.rounds}
          card={state.currentCard}
          options={state.options}
          onStartVoting={() => dispatch({ type: 'START_VOTING' })}
        />
      );

    case 'handoff-vote': {
      const team = state.teams.find(
        (candidate) => candidate.id === state.order[state.orderIndex]
      );
      if (!team) return null;
      return (
        <HandoffVoteScreen
          round={state.round}
          totalRounds={state.config.rounds}
          teamName={team.name}
          onBegin={() => dispatch({ type: 'BEGIN_VOTING' })}
        />
      );
    }

    case 'voting': {
      const team = state.teams.find(
        (candidate) => candidate.id === state.order[state.orderIndex]
      );
      if (!team) return null;
      return (
        <VotingScreen
          key={`vote-${state.round}-${state.orderIndex}`}
          round={state.round}
          totalRounds={state.config.rounds}
          teamName={team.name}
          teamId={team.id}
          options={state.options}
          onVote={(optionId) => dispatch({ type: 'CAST_VOTE', optionId })}
        />
      );
    }

    case 'results':
      if (!state.currentCard) return null;
      return (
        <ResultsScreen
          round={state.round}
          totalRounds={state.config.rounds}
          card={state.currentCard}
          options={state.options}
          votes={state.votes}
          teams={state.teams}
          roundScores={state.roundScores}
          roundDetails={state.roundDetails}
          totals={state.totals}
          scoringMode={state.config.scoringMode}
          onNext={() => dispatch({ type: 'NEXT_ROUND' })}
          onEndGame={() => dispatch({ type: 'END_GAME' })}
        />
      );

    case 'game-over':
      return (
        <GameOverScreen
          teams={state.teams}
          totals={state.totals}
          rounds={state.config.rounds}
          onPlayAgain={() => dispatch({ type: 'PLAY_AGAIN' })}
          onReset={() => dispatch({ type: 'RESET' })}
        />
      );

    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Setup                                                                      */
/* -------------------------------------------------------------------------- */

function SetupScreen({
  initialConfig,
  initialTeams,
  onStart,
}: {
  initialConfig: DerbyConfig;
  initialTeams: DerbyTeam[];
  onStart: (config: DerbyConfig, teams: DerbyTeam[]) => void;
}) {
  const [config, setConfig] = useState<DerbyConfig>(initialConfig);
  const [teams, setTeams] = useState<DerbyTeam[]>(initialTeams);
  const [error, setError] = useState<string | null>(null);

  const trimmed = teams.map((team) => ({ ...team, name: team.name.trim() }));
  const hasBlankName = trimmed.some((team) => team.name.length === 0);
  const hasDuplicateName =
    new Set(trimmed.map((team) => team.name.toLowerCase())).size !== trimmed.length;
  const canStart = !hasBlankName && !hasDuplicateName && teams.length >= 3;

  function updateTeam(id: string, name: string) {
    setTeams((current) =>
      current.map((team) => (team.id === id ? { ...team, name } : team))
    );
    setError(null);
  }

  function addTeam() {
    if (teams.length >= 6) return;
    setTeams((current) => [
      ...current,
      { id: `team-${Date.now().toString(36)}`, name: teamLetterName(current) },
    ]);
    setError(null);
  }

  function removeTeam(id: string) {
    if (teams.length <= 3) return;
    setTeams((current) => current.filter((team) => team.id !== id));
    setError(null);
  }

  function handleStart() {
    if (hasBlankName) {
      setError('Give every team a name before starting.');
      return;
    }
    if (hasDuplicateName) {
      setError('Team names must be unique.');
      return;
    }
    if (teams.length < 3) {
      setError('Definition Derby needs at least 3 teams so voting is meaningful.');
      return;
    }
    onStart(
      config,
      trimmed.map((team) => ({ ...team, name: team.name }))
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <Gamepad2 className="h-6 w-6 text-primary" />
            Set up your Derby
          </CardTitle>
          <CardDescription>
            Choose teams, category, and scoring. The game runs entirely on this
            device — pass it between teams each turn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Teams
              </Label>
              <span className="text-xs text-muted-foreground">3–6 teams</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center gap-2">
                  <Input
                    value={team.name}
                    onChange={(event) => updateTeam(team.id, event.target.value)}
                    maxLength={28}
                    aria-label="Team name"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTeam(team.id)}
                    disabled={teams.length <= 3}
                    aria-label={`Remove ${team.name || 'team'}`}
                  >
                    <span aria-hidden="true">×</span>
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTeam}
                disabled={teams.length >= 6}
              >
                Add team
              </Button>
              {hasBlankName ? (
                <p className="text-xs text-destructive">Every team needs a name.</p>
              ) : hasDuplicateName ? (
                <p className="text-xs text-destructive">Team names must be unique.</p>
              ) : null}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="derby-category">Category</Label>
              <Select
                value={config.category}
                onValueChange={(value) =>
                  setConfig((current) => ({
                    ...current,
                    category: value as CategoryFilter,
                  }))
                }
              >
                <SelectTrigger id="derby-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All categories</SelectItem>
                  {DERBY_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="derby-rounds">Rounds</Label>
              <Select
                value={String(config.rounds)}
                onValueChange={(value) =>
                  setConfig((current) => ({ ...current, rounds: Number(value) }))
                }
              >
                <SelectTrigger id="derby-rounds">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 8, 10].map((rounds) => (
                    <SelectItem key={rounds} value={String(rounds)}>
                      {rounds} rounds
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="derby-timer">Writing time per team</Label>
              <Select
                value={String(config.writingSeconds)}
                onValueChange={(value) =>
                  setConfig((current) => ({
                    ...current,
                    writingSeconds: Number(value),
                  }))
                }
              >
                <SelectTrigger id="derby-timer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No timer</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="45">45 seconds</SelectItem>
                  <SelectItem value="60">60 seconds</SelectItem>
                  <SelectItem value="90">90 seconds</SelectItem>
                  <SelectItem value="120">2 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Scoring</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {SCORING_MODES.map((mode) => {
                const selected = config.scoringMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() =>
                      setConfig((current) => ({
                        ...current,
                        scoringMode: mode.value,
                      }))
                    }
                    aria-pressed={selected}
                    className={cn(
                      'rounded-lg border p-3 text-left transition-colors',
                      selected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <p className="text-sm font-semibold">{mode.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {mode.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            className="w-full"
            size="lg"
            onClick={handleStart}
            disabled={!canStart}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Definition Derby
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <BookOpen className="h-5 w-5 text-primary" />
            How to play
          </CardTitle>
          <CardDescription>
            A classroom gameshow based on Balderdash.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <ol className="list-decimal space-y-3 pl-5">
            <li>
              <span className="font-medium">Read the stimulus aloud.</span> The
              host reads the word, person, law, acronym, or movie title to the
              class. Teams get one turn each on this device to invent a
              convincing fake answer — everyone else looks away.
            </li>
            <li>
              <span className="font-medium">Mix the answers.</span> When every
              team has locked in, the host reads all answers aloud in random
              order. The real answer is hidden among them — don&apos;t reveal
              which is which yet.
            </li>
            <li>
              <span className="font-medium">Vote secretly.</span> Pass the
              device team by team. Each team picks the answer it thinks is real.
              Teams cannot vote for their own fake.
            </li>
            <li>
              <span className="font-medium">Reveal and score.</span> The game
              reveals the real answer and awards points using the scoring rule
              you chose.
            </li>
            <li>
              <span className="font-medium">Rotate and repeat.</span> The team
              with the fewest total points starts the next round. After the
              final round, the highest total wins.
            </li>
          </ol>

          <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              Tip: use the category that matches your current unit — vocabulary
              lists for Word, a history unit for Person or Law. The game
              reinforces real content while the bluffing adds the fun.
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-lg border p-3">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              What you need: one tablet or laptop to pass between teams. A
              projector is optional for the reveal and scoreboard. Nothing is
              saved after you leave the page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Round screens                                                              */
/* -------------------------------------------------------------------------- */

function RoundBadge({
  round,
  totalRounds,
  card,
}: {
  round: number;
  totalRounds: number;
  card: StimulusCard;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Badge variant="outline">
        Round {round} of {totalRounds}
      </Badge>
      <Badge variant="secondary">{card.category}</Badge>
    </div>
  );
}

function HandoffWriteScreen({
  round,
  totalRounds,
  card,
  teamName,
  isFirstTeam,
  onBegin,
}: {
  round: number;
  totalRounds: number;
  card: StimulusCard;
  teamName: string;
  isFirstTeam: boolean;
  onBegin: () => void;
}) {
  return (
    <Card className="mx-auto max-w-2xl text-center">
      <CardHeader className="space-y-3">
        <div className="flex justify-center">
          <RoundBadge round={round} totalRounds={totalRounds} card={card} />
        </div>
        <CardTitle className="font-headline text-2xl">
          Pass the device to {teamName}
        </CardTitle>
        <CardDescription>
          Everyone else: look away while {teamName} writes. The team gets one
          turn to invent a fake answer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/40 p-4 text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {isFirstTeam
              ? 'Read this aloud to the class'
              : 'Stimulus — already read aloud'}
          </p>
          <p className="mt-2 font-headline text-xl font-semibold leading-snug">
            {card.prompt}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {teamName}, make your answer sound believable — but don&apos;t copy the
          real definition if you happen to know it.
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button type="button" size="lg" onClick={onBegin}>
          <PenLine className="mr-2 h-4 w-4" />
          {teamName} is ready — start writing
        </Button>
      </CardFooter>
    </Card>
  );
}

function WritingScreen({
  round,
  totalRounds,
  card,
  teamName,
  writingSeconds,
  onLockIn,
}: {
  round: number;
  totalRounds: number;
  card: StimulusCard;
  teamName: string;
  writingSeconds: number;
  onLockIn: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(writingSeconds);

  useEffect(() => {
    if (writingSeconds <= 0) return;
    setSecondsLeft(writingSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [writingSeconds]);

  const timeUp = writingSeconds > 0 && secondsLeft === 0;

  function handleSubmit() {
    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setError('Write a fake answer before locking it in.');
      return;
    }
    onLockIn(trimmed);
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <RoundBadge round={round} totalRounds={totalRounds} card={card} />
          {writingSeconds > 0 ? (
            <Badge
              variant={timeUp ? 'destructive' : 'outline'}
              className="flex items-center gap-1"
            >
              <Timer className="h-3 w-3" />
              {timeUp ? "Time's up" : `${secondsLeft}s`}
            </Badge>
          ) : null}
        </div>
        <CardTitle className="font-headline text-xl">
          {teamName}&apos;s turn to bluff
        </CardTitle>
        <CardDescription>
          Write a plausible definition for the stimulus. The more convincing it
          sounds, the better your chances of fooling the other teams.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Stimulus
          </p>
          <p className="mt-1 font-headline text-lg font-semibold">{card.prompt}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="derby-answer">Your fake answer</Label>
          <Textarea
            id="derby-answer"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError(null);
            }}
            placeholder="Type a definition that sounds like it belongs in a textbook…"
            rows={4}
            maxLength={400}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Keep it plausible, not obviously wrong.</span>
            <span>{text.length}/400</span>
          </div>
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <p className="text-xs text-muted-foreground">
          <Lock className="mr-1 inline h-3 w-3" />
          Locked answers cannot be edited.
        </p>
        <Button type="button" onClick={handleSubmit}>
          Lock in {teamName}&apos;s answer
        </Button>
      </CardFooter>
    </Card>
  );
}

function HostRevealScreen({
  round,
  totalRounds,
  card,
  options,
  onStartVoting,
}: {
  round: number;
  totalRounds: number;
  card: StimulusCard;
  options: RoundOption[];
  onStartVoting: () => void;
}) {
  const [showKey, setShowKey] = useState(false);

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <RoundBadge round={round} totalRounds={totalRounds} card={card} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowKey((current) => !current)}
          >
            {showKey ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" /> Hide host key
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" /> Show host key
              </>
            )}
          </Button>
        </div>
        <CardTitle className="font-headline text-2xl">
          Host: read all answers aloud
        </CardTitle>
        <CardDescription>
          The real answer is mixed in at random. Read each option in order
          without saying which team wrote it, and keep the host key hidden from
          the class.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Stimulus
          </p>
          <p className="mt-1 font-headline text-lg font-semibold">{card.prompt}</p>
        </div>
        <ul className="space-y-2">
          {options.map((option) => {
            const isReal = option.authorTeamId === null;
            return (
              <li
                key={option.id}
                className={cn(
                  'flex gap-3 rounded-lg border p-3',
                  showKey && isReal && 'border-primary bg-primary/5'
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold">
                  {option.letter}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed">{option.text}</p>
                  {showKey ? (
                    <p className="mt-1 text-xs font-medium text-primary">
                      {isReal ? 'This is the real answer' : 'A fake answer'}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted-foreground">
          <Shuffle className="mr-1 inline h-3 w-3" />
          Order was shuffled automatically. Don&apos;t read the host key aloud.
        </p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="button" size="lg" onClick={onStartVoting}>
          Options read — start voting
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function HandoffVoteScreen({
  round,
  totalRounds,
  teamName,
  onBegin,
}: {
  round: number;
  totalRounds: number;
  teamName: string;
  onBegin: () => void;
}) {
  return (
    <Card className="mx-auto max-w-2xl text-center">
      <CardHeader className="space-y-3">
        <div className="flex justify-center">
          <Badge variant="outline">
            Round {round} of {totalRounds}
          </Badge>
        </div>
        <CardTitle className="font-headline text-2xl">
          Pass the device to {teamName}
        </CardTitle>
        <CardDescription>
          Vote secretly. Everyone else: look away. {teamName} picks the answer
          that sounds most like the real one — but cannot vote for its own fake.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-center">
        <Button type="button" size="lg" onClick={onBegin}>
          <Lock className="mr-2 h-4 w-4" />
          {teamName} is ready — vote secretly
        </Button>
      </CardFooter>
    </Card>
  );
}

function VotingScreen({
  round,
  totalRounds,
  teamName,
  teamId,
  options,
  onVote,
}: {
  round: number;
  totalRounds: number;
  teamName: string;
  teamId: string;
  options: RoundOption[];
  onVote: (optionId: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!selectedId) {
      setError('Choose the answer you think is real.');
      return;
    }
    const option = options.find((candidate) => candidate.id === selectedId);
    if (!option) {
      setError('That answer is no longer available.');
      return;
    }
    if (option.authorTeamId === teamId) {
      setError("That's your own answer — choose a different one.");
      return;
    }
    onVote(selectedId);
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline">
            Round {round} of {totalRounds}
          </Badge>
          <Badge variant="secondary">{teamName} voting</Badge>
        </div>
        <CardTitle className="font-headline text-xl">
          Which answer is real?
        </CardTitle>
        <CardDescription>
          Pick one. Your vote stays secret until the reveal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {options.map((option) => {
          const selected = selectedId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setSelectedId(option.id);
                setError(null);
              }}
              aria-pressed={selected}
              className={cn(
                'flex w-full gap-3 rounded-lg border p-3 text-left transition-colors',
                selected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'hover:bg-muted/50'
              )}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold">
                {option.letter}
              </span>
              <span className="text-sm leading-relaxed">{option.text}</span>
            </button>
          );
        })}
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="button" onClick={handleSubmit} disabled={!selectedId}>
          Cast {teamName}&apos;s vote
        </Button>
      </CardFooter>
    </Card>
  );
}

function ResultsScreen({
  round,
  totalRounds,
  card,
  options,
  votes,
  teams,
  roundScores,
  roundDetails,
  totals,
  scoringMode,
  onNext,
  onEndGame,
}: {
  round: number;
  totalRounds: number;
  card: StimulusCard;
  options: RoundOption[];
  votes: RoundVote[];
  teams: DerbyTeam[];
  roundScores: Record<string, number>;
  roundDetails: RoundScoreDetail[];
  totals: Record<string, number>;
  scoringMode: DerbyScoringMode;
  onNext: () => void;
  onEndGame: () => void;
}) {
  const realOption = options.find((option) => option.authorTeamId === null);
  const standings = sortedStandings(teams, totals);
  const isLastRound = round >= totalRounds;
  const scoringLabel =
    SCORING_MODES.find((mode) => mode.value === scoringMode)?.title ?? 'Classic';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border-primary/40">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <RoundBadge round={round} totalRounds={totalRounds} card={card} />
            <Badge variant="outline">{scoringLabel} scoring</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <Trophy className="h-6 w-6 text-primary" />
            Reveal &amp; score
          </CardTitle>
          <CardDescription>The real answer was:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {card.category} · real answer
            </p>
            <p className="mt-2 text-sm leading-relaxed">{realOption?.text}</p>
          </div>

          <div className="space-y-2">
            {options.map((option) => {
              const voters = votes
                .filter((vote) => vote.optionId === option.id)
                .map(
                  (vote) =>
                    teams.find((team) => team.id === vote.teamId)?.name ?? 'Unknown'
                );
              const author = option.authorTeamId
                ? teams.find((team) => team.id === option.authorTeamId)?.name
                : null;
              const isReal = option.authorTeamId === null;
              return (
                <div
                  key={option.id}
                  className={cn(
                    'rounded-lg border p-3',
                    isReal && 'border-primary/40 bg-primary/5'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold">
                      {option.letter}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed">{option.text}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={isReal ? 'default' : 'secondary'}>
                          {isReal ? 'Real answer' : author ? `Written by ${author}` : 'Fake answer'}
                        </Badge>
                        <span>
                          {voters.length > 0
                            ? `${voters.length} vote(s): ${voters.join(', ')}`
                            : 'No votes'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">This round</CardTitle>
            <CardDescription>Points awarded for round {round}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {roundDetails
              .slice()
              .sort((a, b) => b.points - a.points)
              .map((detail) => (
                <div key={detail.teamId} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{detail.teamName}</p>
                    <Badge variant={detail.points > 0 ? 'default' : 'outline'}>
                      +{detail.points}
                    </Badge>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {detail.reasons.map((reason) => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              ))}
            <p className="text-xs text-muted-foreground">
              Round points total: {Object.values(roundScores).reduce((sum, points) => sum + points, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">Standings</CardTitle>
            <CardDescription>Running totals after round {round}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {standings.map((entry, index) => (
              <div
                key={entry.team.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{entry.team.name}</span>
                </div>
                <span className="text-sm font-semibold">{entry.points}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" onClick={onEndGame}>
          End game early
        </Button>
        <Button type="button" size="lg" onClick={onNext}>
          {isLastRound ? 'Final standings' : 'Next round'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Game over                                                                  */
/* -------------------------------------------------------------------------- */

function GameOverScreen({
  teams,
  totals,
  rounds,
  onPlayAgain,
  onReset,
}: {
  teams: DerbyTeam[];
  totals: Record<string, number>;
  rounds: number;
  onPlayAgain: () => void;
  onReset: () => void;
}) {
  const standings = sortedStandings(teams, totals);
  const topScore = standings[0]?.points ?? 0;
  const champions = standings.filter((entry) => entry.points === topScore);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="text-center">
        <CardHeader className="space-y-2">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Crown className="h-7 w-7 text-primary" />
            </div>
          </div>
          <CardTitle className="font-headline text-3xl">
            {champions.length === 1
              ? `${champions[0].team.name} wins!`
              : topScore > 0
                ? 'It’s a tie!'
                : 'Game over'}
          </CardTitle>
          <CardDescription>
            Final results after {rounds} round{rounds === 1 ? '' : 's'} of
            Definition Derby.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-left">
          {standings.map((entry, index) => (
            <div
              key={entry.team.id}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg border p-3',
                entry.points === topScore && topScore > 0 && 'border-primary bg-primary/5'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{entry.team.name}</span>
                {entry.points === topScore && topScore > 0 ? (
                  <Trophy className="h-4 w-4 text-primary" />
                ) : null}
              </div>
              <span className="text-sm font-semibold">{entry.points} pts</span>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" size="lg" onClick={onPlayAgain}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Play again — same teams
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onReset}>
            New game setup
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
