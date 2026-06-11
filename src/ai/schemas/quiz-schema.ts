import { z } from 'zod';

/**
 * Supported question types for HydraLearn quizzes.
 * This allows for a variety of cognitive assessments beyond just MCQs.
 */
export enum QuestionType {
  MCQ = 'MCQ',
  FILL_BLANK = 'FILL_BLANK',
  MATCHING = 'MATCHING',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
}

export const QuizQuestionSchema = z.object({
  type: z.nativeEnum(QuestionType).describe('The format of the question.'),
  question: z.string().describe('The question text or the prompt for the student.'),

  // Options are used for MCQ and Matching. For Fill-in-the-blank, this remains empty.
  options: z.array(z.string()).optional().describe('A list of possible answers or items to match.'),

  answer: z.string().describe('The correct answer or the key to the correct option.'),

  explanation: z.string().optional().describe('A pedagogical explanation of why this is the correct answer, helpful for student review.'),

  memeQuery: z.string().optional().describe('A search query for a relevant meme or image to make this question more engaging.'),
});
