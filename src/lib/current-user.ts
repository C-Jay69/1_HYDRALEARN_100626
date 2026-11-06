import { cookies, headers } from 'next/headers';

import { db } from './db';
import {
  anonymousUserId,
  USER_ID_COOKIE,
  USER_ID_HEADER,
  USER_ID_PATTERN,
} from './user-id';

export const PLACEHOLDER_USER_ID = 'placeholder-user';

/**
 * HydraLearn does not have real authentication yet. To still give each browser
 * its own library, the middleware assigns an anonymous id cookie and forwards
 * it as a request header. When NextAuth is wired up later, only this function
 * needs to change.
 */
async function ensureUser(id: string) {
  const isAnonymous = id.startsWith('anon_');
  await db.user.upsert({
    where: { id },
    update: {},
    create: {
      id,
      email: isAnonymous
        ? `${id}@guest.hydralearn.local`
        : 'placeholder@hydralearn.local',
      name: isAnonymous ? 'Guest' : 'HydraLearn User',
      role: 'STUDENT',
    },
  });
}

async function ensurePlaceholderUser() {
  await ensureUser(PLACEHOLDER_USER_ID);
  return PLACEHOLDER_USER_ID;
}

/** Resolve (and lazily create) the user that owns generated content. */
export async function getCurrentUserId(): Promise<string> {
  try {
    const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
    const rawUid =
      headerStore.get(USER_ID_HEADER)?.trim() ||
      cookieStore.get(USER_ID_COOKIE)?.value?.trim();

    if (rawUid && USER_ID_PATTERN.test(rawUid)) {
      const id = anonymousUserId(rawUid);
      await ensureUser(id);
      return id;
    }
  } catch {
    // `headers()`/`cookies()` are unavailable outside a request; fall through.
  }

  return ensurePlaceholderUser();
}
