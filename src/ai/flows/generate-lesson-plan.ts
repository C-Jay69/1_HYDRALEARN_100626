'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized lesson plans for students.
 * It now leverages the Pedagogical Router to ensure a theory-driven approach.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getPedagogicalStrategy, PedagogicalRouterInput } from './pedagogical-router';

/**
 * Input schema for the generateLessonPlan flow.
 */
const GenerateLessonPlanInputSchema = z.object({
  studentNeeds: z
    .string()
    .describe('A detailed description of the student’s learning needs and gaps.'),
  curriculum: z
    .string()
    .describe('The official curriculum to be used as a reference (e.g., Common Core, IB).'),
  objectives: z
    .string()
    .describe('Specific lesson objectives to be achieved.'),
  gradeLevel: z.string().describe('The grade level of the student.'),
  subject: z.string().describe('The subject of the lesson plan.'),
  topic: z.string().describe('The specific topic of the lesson.'),
  tone: z.string().default('Academic').describe('The desired tone (e.g., Fun, Academic, Cheeky).'),
});

export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

const GenerateLessonPlanOutputSchema = z.object({
  lessonPlan: z
    .string()
    .describe('A detailed, personalized lesson plan for the student.'),
});

export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;

export async function generateLessonPlan(input: GenerateLessonPlanInput): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFlow(input);
}

/**
 * Prompt definition for generating the personalized lesson plan.
 * Now accepts a pedagogical strategy as a core input.
 */
const generateLessonPlanPrompt = ai.definePrompt({
  name: 'generateLessonPlanPrompt',
  input: z.object({
    input: GenerateLessonPlanInputSchema,
    strategy: z.any(), // PedagogicalRouterOutput
  }),
  output: {schema: GenerateLessonPlanOutputSchema},
  prompt: `You are an expert teacher. You are generating a lesson plan based on the following pedagogical blueprint:

PEDAGOGICAL STRATEGY:
- Primary Theory: {{{strategy.primaryTheory}}}
- Key Theorist: {{{strategy.keyTheorist}}}
- Implementation Detail: {{{strategy.strategyDetails}}}
- Engagement Goal: {{{strategy.suggestedEngagement}}}

LESSON CONTEXT:
- Subject: {{{input.subject}}}
- Topic: {{{input.topic}}}
- Grade Level: {{{input.gradeLevel}}}
- Curriculum: {{{input.curriculum}}}
- Objectives: {{{input.objectives}}}
- Student Needs: {{{input.studentNeeds}}}
- Desired Tone: {{{input.tone}}}

INSTRUCTIONS:
1. Strictly follow the Pedagogical Strategy provided above.
2. If the strategy is Constructivist, focus on inquiry-based learning. If Behaviorist, focus on clear objectives and reinforcement.
3. Integrate the "Desired Tone" throughout the materials.
4. Ensure the plan is adaptive and caters to the specific student needs mentioned.
5. Format the output for a teacher to use immediately.

Generate a single, comprehensive lesson plan.`,
});

const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async (input) => {
    // STEP 1: Consult the Pedagogical Router
    const strategy = await getPedagogicalStrategy({
      subject: input.subject,
      topic: input.topic,
      age: input.gradeLevel,
      tone: input.tone,
    });

    // STEP 2: Generate the plan using the strategy
    const {output} = await generateLessonPlanPrompt({
      input: input,
      strategy: strategy,
    });

    return output!;
  }
);
