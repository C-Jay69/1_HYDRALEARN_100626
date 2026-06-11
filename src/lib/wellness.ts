import { db } from './db';

/**
 * Wellness Service for HydraLearn.
 * Handles daily mood tracking and emotional health analytics for students.
 */

export async function submitWellnessCheckin(data: {
  studentId: string;
  mood: string; // e.g., "Happy", "Anxious", "Tired", "Stressed", "Excited"
  note?: string;
}) {
  // 1. Save the check-in to the database
  const checkin = await db.wellnessCheckin.create({
    data: {
      studentId: data.studentId,
      mood: data.mood,
      note: data.note,
    },
  });

  // 2. AUTOMATED ALERT LOGIC
  // Check if the student has reported a negative mood for 3 consecutive check-ins.
  const lastThree = await db.wellnessCheckin.findMany({
    where: { studentId: data.studentId },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const negativeMoods = ['Anxious', 'Stressed', 'Sad', 'Distressed'];
  const isConsistentDistress = lastThree.length === 3 &&
    lastThree.every(c => negativeMoods.includes(c.mood));

  if (isConsistentDistress) {
    console.log(`WELLNESS ALERT: Student ${data.studentId} has reported negative moods for 3 consecutive check-ins. Notify counselor.`);
  }

  return { success: true, checkinId: checkin.id };
}

/**
 * Fetches wellness trends for a specific class.
 * This is used to build the "Class Mood Heatmap" for teachers.
 */
export async function getClassWellnessTrends(classId: string) {
  // 1. Get all students in the class
  const enrollments = await db.enrollment.findMany({
    where: { classId },
    include: {
      student: {
        include: {
          wellnessLogs: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Get only the most recent mood
          },
        },
      },
    },
  });

  // 2. Aggregate the current mood of the class
  const moodCounts: Record<string, number> = {};

  enrollments.forEach(e => {
    const lastMood = e.student.wellnessLogs[0]?.mood || 'No Data';
    moodCounts[lastMood] = (moodCounts[lastMood] || 0) + 1;
  });

  return {
    totalStudents: enrollments.length,
    moodDistribution: moodCounts,
  };
}

/**
 * Fetches a detailed mood history for a single student.
 */
export async function getStudentWellnessHistory(studentId: string) {
  return db.wellnessCheckin.findMany({
    where: { studentId },
    orderBy: { createdAt: 'asc' },
  });
}
