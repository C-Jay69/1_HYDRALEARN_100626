import { db } from './db';

/**
 * Marketplace Service for HydraLearn.
 * Handles the publishing, browsing, and acquisition of educational materials.
 */

export async function publishLessonPlan(lessonPlanId: string, price: number) {
  return db.lessonPlan.update({
    where: { id: lessonPlanId },
    data: {
      isPublic: true,
      price: price,
    },
  });
}

/**
 * Fetches a list of available public lesson plans.
 * Includes filters for subject and price.
 */
export async function getPublicLessons(filters: { subject?: string; maxPrice?: number } = {}) {
  return db.lessonPlan.findMany({
    where: {
      isPublic: true,
      ...(filters.subject && { subject: filters.subject }),
      ...(filters.maxPrice && { price: { lte: filters.maxPrice } }),
    },
    include: {
      teacher: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Handles the "acquisition" of a lesson plan.
 * In a bootstrapper model, we simply copy the public plan into the buyer's private library.
 */
export async function acquireLessonPlan(lessonPlanId: string, buyerId: string) {
  // 1. Find the original plan
  const original = await db.lessonPlan.findUnique({
    where: { id: lessonPlanId },
    include: {
      activities: true,
      quizzes: {
        include: {
          questions: true,
        },
      },
    },
  });

  if (!original) throw new Error('Lesson plan not found');

  // 2. Create a copy for the buyer
  const newPlan = await db.lessonPlan.create({
    data: {
      title: `[Copied] ${original.title}`,
      content: original.content,
      pedagogicalStrategy: original.pedagogicalStrategy,
      gradeLevel: original.gradeLevel,
      subject: original.subject,
      teacherId: buyerId,
      isPublic: false, // Private by default when copied
      price: 0,
      // Copy activities
      activities: {
        create: original.activities.map(a => ({
          type: a.type,
          content: a.content,
        })),
      },
      // Copy quizzes
      quizzes: {
        create: original.quizzes.map(q => ({
          title: q.title,
          questions: {
            create: q.questions.map(question => ({
              text: question.text,
              type: question.type,
              options: question.options,
              answer: question.answer,
              points: question.points,
            })),
          },
        })),
      },
    },
  });

  return newPlan;
}
