'use server';

/**
 * @fileOverview Lifeline helpers for the Millionaire game.
 *
 * Phone a Friend and Ask the Audience are simulated with the same Genkit
 * instance used by the rest of the app. 50:50 is pure client-side logic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const optionSchema = z.object({
  question: z.string().describe('The trivia question.'),
  optA: z.string().describe('Option A text.'),
  optB: z.string().describe('Option B text.'),
  optC: z.string().describe('Option C text.'),
  optD: z.string().describe('Option D text.'),
});

const confidenceSchema = z.object({
  advice: z.string().describe('The friend\'s reasoning for their recommended answer.'),
  confidence: z
    .object({
      A: z.number().min(0).max(100),
      B: z.number().min(0).max(100),
      C: z.number().min(0).max(100),
      D: z.number().min(0).max(100),
    })
    .describe('Confidence percentage for each option (should sum to ~100).'),
});

const pollSchema = z.object({
  poll: z
    .object({
      A: z.number().min(0).max(100),
      B: z.number().min(0).max(100),
      C: z.number().min(0).max(100),
      D: z.number().min(0).max(100),
    })
    .describe('Percentage of audience members who voted for each option.'),
  winner: z.string().describe('The letter of the option with the most votes.'),
});

const phoneAFriendPrompt = ai.definePrompt({
  name: 'phoneAFriend',
  input: {schema: optionSchema},
  output: {schema: confidenceSchema},
  prompt: `You are a helpful friend giving advice on a trivia question.

Question: {{{question}}}
Options:
A) {{{optA}}}
B) {{{optB}}}
C) {{{optC}}}
D) {{{optD}}}

Which option do you think is most likely correct? Provide your reasoning and a confidence percentage for each option. The percentages should sum to 100.`,
});

const askAudiencePrompt = ai.definePrompt({
  name: 'askAudience',
  input: {schema: optionSchema},
  output: {schema: pollSchema},
  prompt: `You are simulating an audience poll for a trivia game show.

Question: {{{question}}}
Options:
A) {{{optA}}}
B) {{{optB}}}
C) {{{optC}}}
D) {{{optD}}}

Simulate 100 audience members each picking one option. Return the percentage breakdown and which option got the most votes.`,
});

export interface PhoneAFriendResult {
  advice: string;
  confidence: {A: number; B: number; C: number; D: number};
}

export interface AskAudienceResult {
  poll: {A: number; B: number; C: number; D: number};
  winner: string;
}

/**
 * Ask the AI to simulate a phone-a-friend lifeline.
 * Returns `null` if the model produced no output or the call failed.
 */
export async function phoneAFriend(
  question: string,
  options: string[]
): Promise<PhoneAFriendResult | null> {
  try {
    const {output} = await phoneAFriendPrompt({
      question,
      optA: options[0] ?? '',
      optB: options[1] ?? '',
      optC: options[2] ?? '',
      optD: options[3] ?? '',
    });
    return output ?? null;
  } catch (err) {
    console.warn('phoneAFriend: lifeline call failed', err);
    return null;
  }
}

/**
 * Ask the AI to simulate an ask-the-audience lifeline.
 * Returns `null` if the model produced no output or the call failed.
 */
export async function askAudience(
  question: string,
  options: string[]
): Promise<AskAudienceResult | null> {
  try {
    const {output} = await askAudiencePrompt({
      question,
      optA: options[0] ?? '',
      optB: options[1] ?? '',
      optC: options[2] ?? '',
      optD: options[3] ?? '',
    });
    return output ?? null;
  } catch (err) {
    console.warn('askAudience: lifeline call failed', err);
    return null;
  }
}