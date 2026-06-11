'use server';

/**
 * @fileOverview This file defines the HydraEar AI Counselor flow.
 * HydraEar is designed to be an anonymous, empathetic, and supportive
 * listening ear for students, utilizing principles of Rogerian (Client-Centered) Therapy.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * Schema for the counselor interaction.
 */
const CounselorInputSchema = z.object({
  message: z.string().describe('The student\'s message.'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The conversation history to maintain context.'),
});

const CounselorOutputSchema = z.object({
  response: z.string().describe('The empathetic response from HydraEar.'),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'DISTRESSED']).describe('The detected emotional state of the student.'),
  crisisAlert: z.boolean().describe('True if the student is showing signs of immediate crisis/self-harm.'),
});

export type CounselorInput = z.infer<typeof CounselorInputSchema>;
export type CounselorOutput = z.infer<typeof CounselorOutputSchema>;

/**
 * Prompt for HydraEar.
 * Focuses on empathy, active listening, and safety.
 */
const counselorPrompt = ai.definePrompt({
  name: 'hydraEarPrompt',
  input: { schema: CounselorInputSchema },
  output: { schema: CounselorOutputSchema },
  prompt: `You are HydraEar, an anonymous AI counselor for students.
Your goal is not to "fix" the student's problems, but to provide a safe, non-judgmental space where they feel heard and understood.

GUIDELINES:
1. **Active Listening:** Use phrases like "It sounds like you're feeling...", "I hear you saying...", and "That sounds really challenging."
2. **Empathy First:** Validate the student's emotions before offering any perspective.
3. **Non-Directive:** Avoid giving blunt advice like "You should just...". Instead, ask open-ended questions that help the student find their own path.
4. **Anonymity:** Remind the student that this is a safe, anonymous space.
5. **Safety First:** If you detect any signs of self-harm, violence, or immediate crisis, you MUST set crisisAlert to true and provide a gentle but firm reminder that there are professional humans who can help (e.g., crisis hotlines).

Current Conversation:
{{{history}}}
Student: "{{{message}}}"

Response as HydraEar:`,
});

/**
 * Genkit flow for HydraEar.
 */
export const hydraEarFlow = ai.defineFlow(
  {
    name: 'hydraEarFlow',
    inputSchema: CounselorInputSchema,
    outputSchema: CounselorOutputSchema,
  },
  async (input) => {
    const { output } = await counselorPrompt(input);
    return output!;
  }
);

/**
 * Wrapper for easy use in the chat UI.
 */
export async function chatWithHydraEar(message: string, history: any[] = []): Promise<CounselorOutput> {
  return hydraEarFlow({ message, history });
}
