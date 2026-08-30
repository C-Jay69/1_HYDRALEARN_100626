'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating automatic assessments.
 * It now supports multi-format questions and automatic meme query generation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getPedagogicalStrategy } from './pedagogical-router';

const CreateAutomaticAssessmentInputSchema = z.object({
  topic: z.string().describe('The topic of the assessment.'),
  subject: z.string().describe('The subject of the assessment.'),
  gradeLevel: z.string().describe('The grade level of the assessment.'),
  assessmentType: z
    .enum(['quiz', 'game', 'project', 'essay', 'jeopardy', 'millionaire', 'family-feud', 'countdown', 'weakest-link', 'puzzles', 'escape-room'])
    .describe('The type of assessment.'),
  learningObjectives: z
    .string()
    .describe('The learning objectives of the assessment.'),
  curriculum: z
    .string()
    .describe(
      'The curriculum to align the assessment with (e.g., Common Core, IB).'
    ),
  tone: z.string().default('Academic').describe('The desired tone of the assessment.'),
});

export type CreateAutomaticAssessmentInput = z.infer<
  typeof CreateAutomaticAssessmentInputSchema
>;

const GameQuestionSchema = z.object({
  type: z
    .enum(['MCQ', 'FILL_BLANK', 'MATCHING', 'TRUE_FALSE', 'SHORT_ANSWER'])
    .describe('The format of the question.'),
  question: z.string().describe('The question text or the prompt for the student.'),
  options: z
    .array(z.string())
    .optional()
    .describe('A list of possible answers or items to match.'),
  answer: z.string().describe('The correct answer or the key to the correct option.'),
  explanation: z
    .string()
    .optional()
    .describe('A pedagogical explanation of why this is the correct answer.'),
  memeQuery: z
    .string()
    .optional()
    .describe('A search query for a relevant meme or image to make this question more engaging.'),
  // Millionaire / ladder-game metadata — optional, ignored by generic quizzes.
  tier: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe('Question tier/index in the money ladder (0-based).'),
  value: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('Dollar value of this question for ladder games (e.g. Who Wants To Be A Millionaire).'),
});

const CreateAutomaticAssessmentOutputSchema = z.object({
  assessmentContent: z
    .string()
    .describe(
      'The content of the assessment, including questions, instructions, evaluation criteria, and a separate answer key.'
    ),
  feedback: z.string().optional().describe('AI-generated feedback for the assessment.'),
  quiz: z
    .array(z.any())
    .optional()
    .describe('An array of multi-format quiz questions. This MUST be populated for quiz or game-type assessments so the game can be played.'),
});

export type CreateAutomaticAssessmentOutput = z.infer<
  typeof CreateAutomaticAssessmentOutputSchema
>;

export async function createAutomaticAssessment(
  input: CreateAutomaticAssessmentInput
): Promise<CreateAutomaticAssessmentOutput> {
  return createAutomaticAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createAutomaticAssessmentPrompt',
  input: { schema: z.object({
    input: CreateAutomaticAssessmentInputSchema,
    strategy: z.any(), // PedagogicalRouterOutput
  }) },
  output: {schema: CreateAutomaticAssessmentOutputSchema},
  prompt: `You are an expert teacher creating an automatic assessment based on the following pedagogical blueprint:

PEDAGOGICAL STRATEGY:
- Primary Theory: {{{strategy.primaryTheory}}}
- Key Theorist: {{{strategy.keyTheorist}}}
- Implementation Detail: {{{strategy.strategyDetails}}}
- Engagement Goal: {{{strategy.suggestedEngagement}}}

ASSESSMENT CONTEXT:
- Topic: {{{input.topic}}}
- Subject: {{{input.subject}}}
- Grade Level: {{{input.gradeLevel}}}
- Assessment Type: {{{input.assessmentType}}}
- Learning Objectives: {{{input.learningObjectives}}}
- Curriculum: {{{input.curriculum}}}
- Tone: {{{input.tone}}}

INSTRUCTIONS:
1. Strictly follow the Pedagogical Strategy provided.
2. Create a mix of question types to test different cognitive levels (e.g., recall, application, synthesis).
3. If the assessmentType is 'quiz', 'game', or any game type (jeopardy, millionaire, family-feud, countdown, weakest-link, puzzles, escape-room), you MUST populate the 'quiz' array with structured question objects. Every question object MUST use this exact shape:
    - 'type': one of MCQ, FILL_BLANK, MATCHING, TRUE_FALSE, or SHORT_ANSWER.
    - 'question': the question text or prompt for the student.
    - 'options': for MCQ questions, an array of 4 possible answers; for MATCHING, an array of items to match. Leave empty/omit for other types.
    - 'answer': the correct answer (or the correct option text).
    - 'explanation': a clear pedagogical explanation of why this is the correct answer.
    - 'memeQuery': a short, funny search phrase that would result in a relevant meme about the topic or the feeling of getting the question wrong/right.
4. The 'assessmentContent' field must contain the complete human-readable game: full instructions, all rounds/levels/questions, and the answer key so it can be played off a printout as well.
5. Format: The output for 'assessmentContent' MUST be plain text or Markdown.
6. Answer Key: You MUST include a clearly labeled "Answer Key" section.
7. The 'feedback' field must contain AI-generated feedback for the teacher on the quality of the generated assessment.
8. CRITICAL: At the END of 'assessmentContent', on its own line, embed the SAME game questions as a machine-readable JSON array inside a markdown fenced code block tagged \`json\`, exactly like this:
\`\`\`json
[{"type":"MCQ","question":"...","options":["...","...","...","..."],"answer":"...","explanation":"...","memeQuery":"..."}]
\`\`\`
   This JSON block MUST contain every playable question (all rounds/levels) in order. Do not put anything else between the \`\`\`json fence.

**Specific Instructions for Game Types (populate 'quiz' accordingly, AND write the full game into 'assessmentContent'):**
- **Jeopardy**: Organize questions into 5 categories with 5 questions each, increasing in difficulty (e.g., 100 to 500 points). Format the 'assessmentContent' as a grid/list of clues, and put all 25 questions into the 'quiz' array as MCQ questions.
- **Who Wants To Be A Millionaire**: Create exactly 15 multiple-choice questions with increasing difficulty. Each question must have 4 options (A, B, C, D). Assign each question a "tier" (0–14) and a "value" (dollar amount matching the official money ladder: $100, $200, $300, $500, $1,000, $2,000, $4,000, $8,000, $16,000, $32,000, $64,000, $125,000, $250,000, $500,000, $1,000,000). Indicate "Lifelines" (50:50, Phone a Friend, Ask the Audience) usage opportunities.
- **Family Feud**: Create 5 "survey" questions. For each question, list the top 5-8 answers with associated "points" (survey percentages).
- **CountDown**: Create a set of "letters rounds" (scrambled letters to form the longest word) and "numbers rounds" (target number to reach using 6 given numbers and basic operations). Provide solutions.
- **The Weakest Link**: Create a rapid-fire sequence of 20 general knowledge questions related to the topic. Include a "Bank" instruction after every few questions.
- **Puzzles**: Create 3-5 puzzles related to the topic (e.g., Crossword clues, Word Search word list, Cryptogram, Logic Puzzle).
- **Escape Room**: Create a narrative-driven scenario where students must solve a series of 5-7 sequential riddles or problems related to the topic to "unlock" the next stage and eventually "escape".

Generate the assessment content and AI-generated feedback based on these instructions.`,
});

const quizExtractionPrompt = ai.definePrompt({
  name: 'extractQuizQuestionsPrompt',
  input: { schema: z.object({
    topic: z.string(),
    assessmentType: z.string(),
    content: z.string(),
  }) },
  prompt: `You are extracting playable questions from an educational game so it can run in an interactive quiz player.

Topic: {{{topic}}}
Game type: {{{assessmentType}}}

Here is the generated game content:
{{{content}}}

Extract EVERY playable question from the content, in order, and return them as a JSON array. Each element MUST be an object with exactly these fields:
- "type": "MCQ", "FILL_BLANK", "MATCHING", "TRUE_FALSE", or "SHORT_ANSWER"
- "question": the question text
- "options": for MCQ, an array of exactly 4 answer option strings; otherwise an empty array
- "answer": the correct answer text (or the correct option)
- "explanation": a brief explanation of the correct answer
- "memeQuery": a short, funny search phrase related to the topic

Output ONLY the raw JSON array. Do NOT wrap it in markdown code fences. Do NOT include any commentary, explanations, or leading/trailing text. The response must start with '[' and end with ']'.`,
});

/**
 * Retry a Genkit prompt call on transient ERR_STREAM_PREMATURE_CLOSE errors.
 *
 * OpenRouter free-tier models frequently close the streamed connection before
 * the full response is delivered (especially for large structured outputs like
 * jeopardy boards). A single retry with a short backoff resolves the vast
 * majority of these cases.
 */
async function callPromptWithRetry<T extends (...args: any[]) => any>(
  fn: T,
  payload: Parameters<T>[0],
): Promise<Awaited<ReturnType<T>>> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fn(payload);
    } catch (err) {
      const code =
        (err as { code?: string })?.code ??
        (err as { cause?: { code?: string } })?.cause?.code;
      const text = (err as Error)?.message ?? '';
      const isPrematureClose =
        code === 'ERR_STREAM_PREMATURE_CLOSE' ||
        /premature close/i.test(text);
      if (!isPrematureClose || attempt === 2) {
        throw err;
      }
      // backoff: 1s, 2s
      await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
    }
  }
  throw new Error('unreachable');
}

const createAutomaticAssessmentFlow = ai.defineFlow(
  {
    name: 'createAutomaticAssessmentFlow',
    inputSchema: CreateAutomaticAssessmentInputSchema,
    outputSchema: CreateAutomaticAssessmentOutputSchema,
  },
  async (input) => {
    const strategy = await getPedagogicalStrategy({
      subject: input.subject,
      topic: input.topic,
      age: input.gradeLevel,
      tone: input.tone,
    });

    const {output} = await callPromptWithRetry(prompt, {
      input: input,
      strategy: strategy,
    });

    if (!output) {
      throw new Error('The model returned no output.');
    }

    // Prefer the structured quiz array. Fall back to extracting questions from the
    // ```json block embedded in assessmentContent (resilient to free models that
    // skip structured tool-call output). As a last resort, ask the model to
    // output ONLY the quiz questions as raw JSON.
    let quiz = normalizeQuiz(output.quiz);
    if (quiz.length === 0) {
      quiz = extractQuizFromContent(output.assessmentContent);
    }
    if (quiz.length === 0) {
      try {
        const extraction = await callPromptWithRetry(quizExtractionPrompt, {
          topic: input.topic,
          assessmentType: input.assessmentType,
          content: output.assessmentContent,
        });
        quiz = parseJsonArray(extraction.text);
      } catch (e) {
        console.warn('createAutomaticAssessment: quiz extraction fallback failed', e);
      }
    }

    return { ...output, quiz };
  }
);

/** Parse a JSON array from raw model text (fence-tolerant), then validate each item. */
function parseJsonArray(text: string): GameQuestion[] {
  if (!text) return [];
  const candidates: string[] = [];

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) candidates.push(fenceMatch[1].trim());

  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    candidates.push(text.slice(firstBracket, lastBracket + 1));
  }
  candidates.push(text.trim());

  for (const candidate of candidates) {
    try {
      const quiz = normalizeQuiz(JSON.parse(candidate));
      if (quiz.length > 0) return quiz;
    } catch {
      // try the next candidate
    }
  }
  return [];
}

function normalizeQuiz(raw: unknown): GameQuestion[] {
  if (!Array.isArray(raw)) return [];
  const quiz: GameQuestion[] = [];
  for (const item of raw) {
    const parsed = GameQuestionSchema.safeParse(coerceQuestion(item));
    if (parsed.success) quiz.push(parsed.data);
  }
  return quiz;
}

/** Extract a JSON quiz array from assessmentContent. Tries the ```json fence first, then any JSON array present in the text. */
function extractQuizFromContent(content: string): GameQuestion[] {
  if (!content) return [];

  const candidates: string[] = [];

  const fenceMatch = content.match(/```json\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) candidates.push(fenceMatch[1].trim());

  const firstBracket = content.indexOf('[');
  const lastBracket = content.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    candidates.push(content.slice(firstBracket, lastBracket + 1));
  }

  for (const candidate of candidates) {
    try {
      const quiz = normalizeQuiz(JSON.parse(candidate));
      if (quiz.length > 0) return quiz;
    } catch {
      // try the next candidate
    }
  }

  console.warn('createAutomaticAssessment: no parseable JSON quiz found in content');
  return [];
}

/** Coerce a possibly-messy question object into the shape expected by GameQuestionSchema. */
function coerceQuestion(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return raw;
  const q = raw as Record<string, unknown>;
  const type = typeof q.type === 'string' && (q.type as string).toUpperCase();
  const types = ['MCQ', 'FILL_BLANK', 'MATCHING', 'TRUE_FALSE', 'SHORT_ANSWER'];
  return {
    ...raw,
    type: type && types.includes(type) ? type : 'MCQ',
    question: typeof q.question === 'string' ? q.question : '',
    options: Array.isArray(q.options) ? q.options.filter((o) => typeof o === 'string') : undefined,
    answer: typeof q.answer === 'string' ? q.answer : '',
  };
}

type GameQuestion = z.infer<typeof GameQuestionSchema>;
