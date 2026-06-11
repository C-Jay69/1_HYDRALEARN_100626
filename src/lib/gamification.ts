import { db } from './db';

/**
 * Gamification Constants
 * These can be moved to a config file later for easier tuning.
 */
export const XP_CONFIG = {
  QUIZ_COMPLETION: 50,
  PERFECT_SCORE: 100,
  LESSON_COMPLETION: 30,
  DAILY_STREAK_BONUS: 20,
  XP_PER_LEVEL: 1000, // Experience points needed to level up
};

export type GamificationResult = {
  newXp: number;
  newLevel: number;
  leveledUp: boolean;
  badgesEarned: string[];
};

/**
 * Awards XP to a user and checks for level-ups and badge achievements.
 * This is the central hub for all gamification triggers in the app.
 */
export async function awardXP(userId: string, points: number, reason: string = 'activity'): Promise<GamificationResult> {
  // 1. Update XP in the database
  const user = await db.user.update({
    where: { id: userId },
    data: {
      xp: {
        increment: points,
      },
    },
  });

  // 2. Calculate Level based on total XP
  // Level = floor(XP / XP_PER_LEVEL) + 1
  const calculatedLevel = Math.floor(user.xp / XP_CONFIG.XP_PER_LEVEL) + 1;

  let leveledUp = false;
  if (calculatedLevel > user.level) {
    leveledUp = true;
    await db.user.update({
      where: { id: userId },
      data: { level: calculatedLevel },
    });
  }

  // 3. Check for Badge achievements
  const badgesEarned = await checkAndAwardBadges(userId, user.xp, calculatedLevel);

  return {
    newXp: user.xp,
    newLevel: calculatedLevel,
    leveledUp,
    badgesEarned,
  };
}

/**
 * Evaluates if a user has met the criteria for any specific badges.
 */
async function checkAndAwardBadges(userId: string, totalXp: number, level: number): Promise<string[]> {
  const earnedBadges = [];

  // Define badge criteria logic here
  const criteria = [
    { name: 'First Steps', xp: 100, description: 'Earned your first 100 XP!' },
    { name: 'Scholar', xp: 1000, description: 'Reached 1,000 total XP!' },
    { name: 'Mastermind', level: 5, description: 'Reached Level 5!' },
    { name: 'Consistent Learner', xp: 5000, description: 'Reached 5,000 total XP!' },
  ];

  for (const c of criteria) {
    // Check if user already has this badge
    const hasBadge = await db.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId: userId,
          badgeId: (await db.badge.findUnique({ where: { name: c.name } }))?.id || 'non-existent',
        },
      },
    });

    if (!hasBadge) {
      const meetsXp = c.xp ? totalXp >= c.xp : true;
      const meetsLevel = c.level ? level >= c.level : true;

      if (meetsXp && meetsLevel) {
        const badge = await db.badge.findUnique({ where: { name: c.name } });
        if (badge) {
          await db.userBadge.create({
            data: {
              userId: userId,
              badgeId: badge.id,
            },
          });
          earnedBadges.push(badge.name);
        }
      }
    }
  }

  return earnedBadges;
}

/**
 * Retrieves the current leaderboard for a specific class.
 */
export async function getClassLeaderboard(classId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { classId },
    include: {
      student: {
        select: {
          name: true,
          xp: true,
          level: true,
        },
      },
    },
  });

  return enrollments
    .map(e => e.student)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10); // Top 10
}
