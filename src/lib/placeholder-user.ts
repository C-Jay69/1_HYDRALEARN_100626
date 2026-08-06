import { db } from './db';

export const PLACEHOLDER_USER_ID = 'placeholder-user';

export async function ensurePlaceholderUser() {
  return db.user.upsert({
    where: { id: PLACEHOLDER_USER_ID },
    update: {},
    create: {
      id: PLACEHOLDER_USER_ID,
      email: 'placeholder@hydralearn.local',
      name: 'HydraLearn User',
      role: 'STUDENT',
    },
  });
}
