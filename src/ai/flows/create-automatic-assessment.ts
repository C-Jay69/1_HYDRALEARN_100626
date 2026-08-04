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
});

const CreateAutomaticAssessmentOutputSchema = z.object({
  assessmentContent: z
    .string()
    .describe(
      'The content of the assessment, including questions, instructions, evaluation criteria, and a separate answer key.'
    ),
  feedback: z.string().describe('AI-generated feedback for the assessment.'),
  quiz: z.array(GameQuestionSchema).optional().describe('An array of multi-format quiz questions. This MUST be populated for quiz or game-type assessments so the game can be played.'),
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

**Specific Instructions for Game Types (populate 'quiz' accordingly, AND write the full game into 'assessmentContent'):**
- **Jeopardy**: Organize questions into 5 categories with 5 questions each, increasing in difficulty (e.g., 100 to 500 points). Format the 'assessmentContent' as a grid/list of clues, and put all 25 questions into the 'quiz' array as MCQ questions.
- **Who Wants To Be A Millionaire**: Create 15 multiple-choice questions with increasing difficulty. Each question must have 4 options (A, B, C, D). Indicate "Lifelines" (50:50, Phone a Friend, Ask the Audience) usage opportunities.
- **Family Feud**: Create 5 "survey" questions. For each question, list the top 5-8 answers with associated "points" (survey percentages).
- **CountDown**: Create a set of "letters rounds" (scrambled letters to form the longest word) and "numbers rounds" (target number to reach using 6 given numbers and basic operations). Provide solutions.
- **The Weakest Link**: Create a rapid-fire sequence of 20 general knowledge questions related to the topic. Include a "Bank" instruction after every few questions.
- **Puzzles**: Create 3-5 puzzles related to the topic (e.g., Crossword clues, Word Search word list, Cryptogram, Logic Puzzle).
- **Escape Room**: Create a narrative-driven scenario where students must solve a series of 5-7 sequential riddles or problems related to the topic to "unlock" the next stage and eventually "escape".

Generate the assessment content and AI-generated feedback based on these instructions.`,
});

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

    const {output} = await prompt({
      input: input,
      strategy: strategy,
    });

    return output!;
  }
);
