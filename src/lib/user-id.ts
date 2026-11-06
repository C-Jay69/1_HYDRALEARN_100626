/**
 * Shared constants for the anonymous per-browser user id. Kept free of any
 * database import so it can be used from Edge middleware.
 */
export const USER_ID_HEADER = 'x-hydralearn-uid';
export const USER_ID_COOKIE = 'hl_uid';
export const USER_ID_PATTERN = /^[a-zA-Z0-9-]{8,64}$/;

export function anonymousUserId(rawUid: string) {
  return `anon_${rawUid}`;
}
