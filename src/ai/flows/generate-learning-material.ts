'use server';

/**
 * @fileOverview A flow for generating custom learning materials.
 * Now leverages the Pedagogical Router to ensure a theory-driven approach.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getPedagogicalStrategy } from './pedagogical-router';

const GenerateLearningMaterialInputSchema = z.object({
  materialType: z.string().describe('The type of material to generate (e.g., Flashcards, Worksheet, Chart).'),
  topic: z.string().describe('The topic for the material.'),
  subject: z.string().describe('The subject for the material.'),
  gradeLevel: z.string().describe('The target grade level for the material.'),
  tone: z.string().default('Academic').describe('The desired tone of the material.'),
  instructions: z.string().optional().describe('Specific instructions for the AI on how to create the material.'),
});

export type GenerateLearningMaterialInput = z.infer<
  typeof GenerateLearningMaterialInputSchema
>;

const GenerateLearningMaterialOutputSchema = z.object({
  content: z
    .string()
    .describe(
      'The generated learning material content, formatted in Markdown.'
    ),
});

export type GenerateLearningMaterialOutput = z.infer<
  typeof GenerateLearningMaterialOutputSchema
>;

export async function generateLearningMaterial(
  input: GenerateLearningMaterialInput
): Promise<GenerateLearningMaterialOutput> {
  return generateLearningMaterialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLearningMaterialPrompt',
  input: z.object({
    input: GenerateLearningMaterialInputSchema,
    strategy: z.any(), // PedagogicalRouterOutput
  }),
  output: {schema: GenerateLearningMaterialOutputSchema},
  prompt: `You are an expert curriculum designer and teacher's assistant.

You are generating learning materials based on the following pedagogical blueprint:

PEDAGOGICAL STRATEGY:
- Primary Theory: {{{strategy.primaryTheory}}}
- Key Theorist: {{{strategy.keyTheorist}}}
- Implementation Detail: {{{strategy.strategyDetails}}}
- Engagement Goal: {{{strategy.suggestedEngagement}}}

MATERIAL CONTEXT:
- Material Type: {{{input.materialType}}}
- Topic: {{{input.topic}}}
- Subject: {{{input.subject}}}
- Grade Level: {{{input.gradeLevel}}}
- Tone: {{{input.tone}}}
- Special Instructions: {{{input.instructions}}}

INSTRUCTIONS:
1. Strictly follow the Pedagogical Strategy provided.
2. For flashcards, use a table format (Front | Back).
3. If the theory is Behaviorist, focus on clear facts and repetition. If Constructivist, focus on conceptual connections.
4. Integrate the "Tone" into the content.
5. Ensure the output is in high-quality Markdown.

Generate the material now.`,
});

const generateLearningMaterialFlow = ai.defineFlow(
  {
    name: 'generateLearningMaterialFlow',
    inputSchema: GenerateLearningMaterialInputSchema,
    outputSchema: GenerateLearningMaterialOutputSchema,
  },
  async (input) => {
    // STEP 1: Consult the Pedagogical Router
    const strategy = await getPedagogicalStrategy({
      subject: input.subject,
      topic: input.topic,
      age: input.gradeLevel,
      tone: input.tone,
    });

    // STEP 2: Generate the material using the strategy
    const {output} = await prompt({
      input: input,
      strategy: strategy,
    });

    return output!;
  }
);
