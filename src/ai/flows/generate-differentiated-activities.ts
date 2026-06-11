'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating differentiated activities for students.
 * Now leverages the Pedagogical Router to ensure activities are based on educational theory.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getPedagogicalStrategy } from './pedagogical-router';

const StudentProfileSchema = z.object({
  studentId: z.string().describe('Unique identifier for the student.'),
  learningStyle: z
    .string()
    .describe(
      'The students preferred learning style (e.g., visual, auditory, kinesthetic).'
    ),
  needs: z.string().describe('Specific learning needs or challenges of the student.'),
  currentLevel: z
    .string()
    .describe('The current skill level of the student in the subject.'),
});

const GenerateDifferentiatedActivitiesInputSchema = z.object({
  topic: z.string().describe('The topic for which activities are needed.'),
  subject: z.string().describe('The subject for the activities.'),
  students: z.array(StudentProfileSchema).describe('Array of student profiles.'),
  gradeLevel: z.string().describe('The grade level of the students.'),
  tone: z.string().default('Academic').describe('The desired tone of the activities.'),
});

export type GenerateDifferentiatedActivitiesInput = z.infer<
  typeof GenerateDifferentiatedActivitiesInputSchema
>;

const SuggestedActivitySchema = z.object({
  studentId: z.string().describe('The student ID for whom the activity is intended.'),
  activityDescription: z
    .string()
    .describe('A description of the suggested activity.'),
  justification: z.string().describe('Why this activity is suitable for the student.'),
});

const GenerateDifferentiatedActivitiesOutputSchema = z.object({
  activities: z.array(SuggestedActivitySchema).describe('List of suggested activities for each student.'),
});

export type GenerateDifferentiatedActivitiesOutput = z.infer<
  typeof GenerateDifferentiatedActivitiesOutputSchema
>;

export async function generateDifferentiatedActivities(
  input: GenerateDifferentiatedActivitiesInput
): Promise<GenerateDifferentiatedActivitiesOutput> {
  return generateDifferentiatedActivitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDifferentiatedActivitiesPrompt',
  input: z.object({
    input: GenerateDifferentiatedActivitiesInputSchema,
    strategy: z.any(), // PedagogicalRouterOutput
  }),
  output: {schema: GenerateDifferentiatedActivitiesOutputSchema},
  prompt: `You are an experienced teacher skilled at creating differentiated learning activities.

You are generating activities based on the following pedagogical blueprint:

PEDAGOGICAL STRATEGY:
- Primary Theory: {{{strategy.primaryTheory}}}
- Key Theorist: {{{strategy.keyTheorist}}}
- Implementation Detail: {{{strategy.strategyDetails}}}
- Engagement Goal: {{{strategy.suggestedEngagement}}}

CONTEXT:
- Topic: {{{input.topic}}}
- Subject: {{{input.subject}}}
- Grade Level: {{{input.gradeLevel}}}
- Tone: {{{input.tone}}}

STUDENT PROFILES:
{{#each input.students}}
- Student ID: {{{studentId}}} | Style: {{{learningStyle}}} | Needs: {{{needs}}} | Level: {{{currentLevel}}}
{{/each}}

INSTRUCTIONS:
1. Strictly follow the Pedagogical Strategy provided.
2. For each student, suggest an activity that blends their personal learning style with the overall pedagogical strategy.
3. Explain the justification by referencing both the Student's profile and the chosen Theory (e.g., "Because the student is a visual learner and we are using Constructivism, I suggest a mind-mapping activity...").
4. Ensure activities are appropriate and engaging.

Generate the differentiated activities now.`,
});

const generateDifferentiatedActivitiesFlow = ai.defineFlow(
  {
    name: 'generateDifferentiatedActivitiesFlow',
    inputSchema: GenerateDifferentiatedActivitiesInputSchema,
    outputSchema: GenerateDifferentiatedActivitiesOutputSchema,
  },
  async input => {
    // STEP 1: Consult the Pedagogical Router
    const strategy = await getPedagogicalStrategy({
      subject: input.subject,
      topic: input.topic,
      age: input.gradeLevel,
      tone: input.tone,
    });

    // STEP 2: Generate the activities using the strategy
    const {output} = await prompt({
      input: input,
      strategy: strategy,
    });

    return output!;
  }
);
