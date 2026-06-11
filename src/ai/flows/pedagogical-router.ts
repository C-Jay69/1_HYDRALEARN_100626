'use server';

/**
 * @fileOverview This file defines the Pedagogical Router for HydraLearn.
 * It acts as the "Brain" of the platform, determining which educational theory
 * to apply based on the student's demographics and the subject matter.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * Schema for the input to the pedagogical router.
 */
const PedagogicalRouterInputSchema = z.object({
  subject: z.string().describe('The subject of the lesson (e.g., Biology, History, Mathematics).'),
  topic: z.string().describe('The specific topic within the subject (e.g., Photosynthesis, The French Revolution).'),
  age: z.string().describe('The age or grade level of the student (e.g., 8 years old, 10th Grade, Adult).'),
  tone: z.string().describe('The desired tone of the materials (e.g., Fun, Academic, Cheeky, Professional).'),
});

export type PedagogicalRouterInput = z.infer<typeof PedagogicalRouterInputSchema>;

/**
 * Schema for the output of the pedagogical router.
 * This structure ensures the subsequent generation flows have a clear strategy to follow.
 */
const PedagogicalRouterOutputSchema = z.object({
  primaryTheory: z.string().describe('The main pedagogical theory to apply (e.g., Constructivism, Behaviorism, Humanism).'),
  keyTheorist: z.string().describe('The primary theorist associated with this approach (e.g., Piaget, Skinner, Maslow).'),
  strategyDetails: z.string().describe('Detailed instructions on HOW to apply this theory to the specific topic and age.'),
  instructionalSteps: z.array(z.string()).describe('A step-by-step sequence for delivering the content.'),
  suggestedEngagement: z.string().describe('Specific suggestions for keeping the student engaged based on the theory.'),
});

export type PedagogicalRouterOutput = z.infer<typeof PedagogicalRouterOutputSchema>;

/**
 * Prompt definition for the pedagogical router.
 * Designed to be provider-agnostic (works with Gemini, OpenRouter, Ollama).
 */
const pedagogicalRouterPrompt = ai.definePrompt({
  name: 'pedagogicalRouterPrompt',
  input: { schema: PedagogicalRouterInputSchema },
  output: { schema: PedagogicalRouterOutputSchema },
  prompt: `You are the Chief Learning Architect for HydraLearn. Your expertise is in the intersection of cognitive science and curriculum design.

Your task is to analyze the provided input and determine the most effective pedagogical strategy.

Input:
- Subject: {{{subject}}}
- Topic: {{{topic}}}
- Age/Level: {{{age}}}
- Desired Tone: {{{tone}}}

Pedagogical Frameworks to consider:
1. Constructivism (Piaget/Vygotsky): Best for conceptual understanding and active discovery.
2. Behaviorism (Skinner/Pavlov): Best for rote learning, skill acquisition, and reinforcement.
3. Humanism (Maslow/Rogers): Best for adult learners, emotional intelligence, and self-directed growth.
4. Multiple Intelligences (Gardner): Best for differentiated instruction.

Instructions:
- Select the primary theory that fits the age and subject.
- Provide a detailed strategy on how to implement this theory for the specific topic.
- Ensure the "Tone" is integrated into the engagement suggestions.
- If the user is an adult and requested "Cheeky" or "Fun" tone, feel free to suggest edgy or humorous parallels.

Return the result as a structured pedagogical blueprint.`,
});

/**
 * Genkit flow for the pedagogical router.
 */
export const pedagogicalRouterFlow = ai.defineFlow(
  {
    name: 'pedagogicalRouterFlow',
    inputSchema: PedagogicalRouterInputSchema,
    outputSchema: PedagogicalRouterOutputSchema,
  },
  async (input) => {
    const { output } = await pedagogicalRouterPrompt(input);
    return output!;
  }
);

/**
 * Wrapper function for easy use in API routes.
 */
export async function getPedagogicalStrategy(input: PedagogicalRouterInput): Promise<PedagogicalRouterOutput> {
  return pedagogicalRouterFlow(input);
}
