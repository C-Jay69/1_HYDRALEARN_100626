'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating automatic assessments.
 * It now supports multi-format questions and automatic meme query generation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { QuizQuestionSchema } from '@/ai/schemas/quiz-schema';
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

const CreateAutomaticAssessmentOutputSchema = z.object({
  assessmentContent: z
    .string()
    .describe(
      'The content of the assessment, including questions, instructions, evaluation criteria, and a separate answer key.'
    ),
  feedback: z.string().describe('AI-generated feedback for the assessment.'),
  quiz: z.array(QuizQuestionSchema).optional().describe('An array of multi-format quiz questions.'),
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
  input: z.object({
    input: CreateAutomaticAssessmentInputSchema,
    strategy: z.any(), // PedagogicalRouterOutput
  }),
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
3. For each question in the 'quiz' array:
    - Select the most appropriate type: MCQ, FILL_BLANK, MATCHING, TRUE_FALSE, or SHORT_ANSWER.
    - Provide a clear explanation for the correct answer.
    - Generate a 'memeQuery' - a short, funny search phrase that would result in a relevant meme about the topic or the feeling of getting the question wrong/right.
4. Format: The output for 'assessmentContent' MUST be plain text or Markdown.
5. Answer Key: You MUST include a clearly labeled "Answer Key" section.

**Specific Instructions for Game Types:**
- **Jeopardy**: Organize questions into 5 categories with 5 questions each, increasing in difficulty.
- **Who Wants To Be A Millionaire**:/ la la l la
- **Family Feud**: Create 5 "survey" questions.
- **CountDown**: Create letters and numbers rounds.
- **The Weakest Link**: Create a rapid-fire sequence of 20 questions.
- **Puzzles**: Create 3-5 puzzles.
- **Escape Room**: Create a narrative-driven scenario with 5-7 sequential riddles.

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
