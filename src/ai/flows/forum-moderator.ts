'use server';

/**
 * @fileOverview This file defines the AI Moderation flow for the HydraForum.
 * It ensures the forum remains a safe space by detecting bullying, harassment,
 * and high-risk content before it is published.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * Schema for the moderation result.
 */
const ModerationResultSchema = z.object({
  isSafe: z.boolean().describe('Whether the content is safe to be published.'),
  flagReason: z.string().optional().describe('The reason why the content was flagged (e.g., "Bullying", "Hate Speech", "Self-Harm").'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().describe('The severity of the violation.'),
  suggestedAction: z.enum(['ALLOW', 'FLAG_FOR_REVIEW', 'BLOCK']).describe('The recommended action to take.'),
});

export type ModerationResult = z.infer<typeof ModerationResultSchema>;

/**
 * Prompt for the forum moderator.
 * Designed to be an unbiased, empathetic, yet strict safety guard.
 */
const moderationPrompt = ai.definePrompt({
  name: 'forumModerationPrompt',
  input: z.object({
    content: z.string().describe('The text of the forum post or reply to be moderated.'),
  }),
  output: { schema: ModerationResultSchema },
  prompt: `You are the HydraLearn Safety Guard. Your primary mission is to keep the HydraForum a supportive and safe environment for students.

You are analyzing the following content:
"{{{content}}}"

Your guidelines:
1. **Bullying/Harassment:** Any content that targets individuals, uses slurs, or attempts to demean others must be blocked.
2. **Hate Speech:** Any content promoting hate against protected groups must be blocked.
3. **Self-Harm/Crisis:** Any content indicating self-harm or mental health crises must be flagged as HIGH severity and marked for immediate administrative review.
4. **Context:** Distinguish between "healthy debate" and "attacks." If it's a heated academic discussion, allow it. If it's personal, block it.

If the content is safe, set isSafe to true and action to ALLOW.
If it's borderline, set isSafe to false and action to FLAG_FOR_REVIEW.
If it's a clear violation, set isSafe to false and action to BLOCK.

Return the result as a structured moderation report.`,
});

/**
 * Genkit flow for forum moderation.
 */
export const forumModerationFlow = ai.defineFlow(
  {
    name: 'forumModerationFlow',
    inputSchema: z.object({ content: z.string() }),
    outputSchema: ModerationResultSchema,
  },
  async (input) => {
    const { output } = await moderationPrompt(input);
    return output!;
  }
);

/**
 * Wrapper for easy use in API routes.
 */
export async function moderateContent(content: string): Promise<ModerationResult> {
  return forumModerationFlow({ content });
}
