import { db } from './db';
import { moderateContent } from '@/ai/flows/forum-moderator';

/**
 * Forum Service for HydraLearn.
 * Handles post creation with real-time AI moderation.
 */

export async function createForumPost(userId: string, content: string, parentId: string | null = null) {
  // 1. Run AI Moderation before saving to database
  const moderation = await moderateContent(content);

  if (moderation.suggestedAction === 'BLOCK') {
    throw new Error(`Content blocked for: ${moderation.flagReason || 'Safety Violation'}`);
  }

  // 2. Create the post
  const post = await db.forumPost.create({
    data: {
      authorId: userId,
      content: content,
      parentId: parentId,
      isFlagged: moderation.suggestedAction === 'FLAG_FOR_REVIEW',
    },
  });

  // 3. If flagged for review, notify admin (Logic for notification would go here)
  if (post.isFlagged) {
    console.log(`ALERT: Post ${post.id} has been flagged for review by the AI moderator.`);
  }

  return post;
}

export async function getForumThreads() {
  return db.forumPost.findMany({
    where: { parentId: null },
    include: {
      author: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getThreadReplies(parentId: string) {
  return db.forumPost.findMany({
    where: { parentId },
    include: {
      author: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}
