'use server';

import { db } from '@/lib/db';

/**
 * Fetches real-time performance analytics for a teacher's class.
 * This transforms raw submission data into a format the ClassPerformanceChart can use.
 */
export async function getClassPerformanceData(classId: string) {
  // 1. Fetch all quizzes associated with this class
  const quizzes = await db.quiz.findMany({
    where: {
      lessonPlan: {
        classId: classId,
      },
    },
    include: {
      submissions: true,
    },
  });

  if (quizzes.length === 0) {
    return [];
  }

  // 2. Calculate average score for each quiz
  const performanceData = quizzes.map(quiz => {
    const totalScore = quiz.submissions.reduce((acc, sub) => acc + sub.score, 0);
    const average = quiz.submissions.length > 0
      ? (totalScore / quiz.submissions.length)
      : 0;

    return {
      subject: quiz.title, // Using quiz title as the subject label
      performance: Math.round(average),
    };
  });

  return performanceData;
}

export async function getStudentAnalytics(studentId: string) {
  return db.submission.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
  });
}
