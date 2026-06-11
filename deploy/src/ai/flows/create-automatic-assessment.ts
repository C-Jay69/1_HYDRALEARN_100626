'use server';

/**
 * @fileOverview A flow for creating automatic assessments.
 *
 * - createAutomaticAssessment - A function that creates automatic assessments.
 * - CreateAutomaticAssessmentInput - The input type for the createAutomaticAssessment function.
 * - CreateAutomaticAssessmentOutput - The return type for the createAutomaticassessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { QuizQuestionSchema } from '@/ai/schemas/quiz-schema';

const CreateAutomaticAssessmentInputSchema = z.object({
  topic: z.string().describe('The topic of the assessment.'),
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
  quiz: z.array(QuizQuestionSchema).optional().describe('An array of quiz questions if the assessment type is game or quiz.'),
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
  input: {schema: CreateAutomaticAssessmentInputSchema},
  output: {schema: CreateAutomaticAssessmentOutputSchema},
  prompt: `You are an expert teacher creating an automatic assessment for the topic of {{{topic}}} for grade level {{{gradeLevel}}}.

The assessment type is {{{assessmentType}}}. The learning objectives are: {{{learningObjectives}}}.

The assessment should align with the {{{curriculum}}} curriculum.

**Instructions for output:**
1.  **Format**: The output for 'assessmentContent' MUST be plain text or Markdown. Do NOT use HTML or any other markup language.
2.  **Content**: Provide the assessment content, including clear questions, instructions, and evaluation criteria.
3.  **Answer Key**: At the end of the 'assessmentContent', you MUST include a clearly labeled "Answer Key" section with the correct answers for all questions.
4.  **Difficulty**: Ensure the assessment has a difficulty appropriate to the grade level.
5.  **Engagement**: Be creative and engaging when creating the assessment.
6.  **Game/Quiz**: If the assessmentType is 'game' or 'quiz', you MUST ALSO populate the 'quiz' field with an array of 5 multiple-choice questions. Each question must have exactly 4 options.

**Specific Instructions for Game Types:**
- **Jeopardy**: Organize questions into 5 categories with 5 questions each, increasing in difficulty (e.g., 100 to 500 points). Format as a grid or list of "Answer" (the clue) and "Question" (the response).
- **Who Wants To Be A Millionaire**: Create 15 multiple-choice questions with increasing difficulty. Each question must have 4 options (A, B, C, D). Indicate "Lifelines" (50:50, Phone a Friend, Ask the Audience) usage opportunities.
- **Family Feud**: Create 5 "survey" questions. For each question, list the top 5-8 answers with associated "points" (survey percentages).
- **CountDown**: Create a set of "letters rounds" (scrambled letters to form the longest word) and "numbers rounds" (target number to reach using 6 given numbers and basic operations). Provide solutions.
- **The Weakest Link**: Create a rapid-fire sequence of 20 general knowledge questions related to the topic. Include a "Bank" instruction after every few questions.
- **Puzzles**: Create 3-5 puzzles related to the topic (e.g., Crossword clues, Word Search word list, Cryptogram, Logic Puzzle).
- **Escape Room**: Create a narrative-driven scenario where students must solve a series of 5-7 sequential riddles or problems related to the topic to "unlock" the next stage and eventually "escape".

Provide the assessment content and AI-generated feedback based on these instructions.`,
});

const createAutomaticAssessmentFlow = ai.defineFlow(
  {
    name: 'createAutomaticAssessmentFlow',
    inputSchema: CreateAutomaticAssessmentInputSchema,
    outputSchema: CreateAutomaticAssessmentOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
