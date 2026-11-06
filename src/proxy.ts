import { NextResponse, type NextRequest } from 'next/server';

import {
  USER_ID_COOKIE,
  USER_ID_HEADER,
  USER_ID_PATTERN,
} from '@/lib/user-id';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Give every browser a stable anonymous id so generated lesson plans and other
 * learning material can be stored per user even before authentication exists.
 * The id is forwarded as a request header so server components/routes can read
 * it on the very first request, before the Set-Cookie response is applied.
 */
export default function proxy(request: NextRequest) {
  const existing = request.cookies.get(USER_ID_COOKIE)?.value;
  const uid =
    existing && USER_ID_PATTERN.test(existing) ? existing : crypto.randomUUID();

  // Never trust a client-supplied identity header: always overwrite it.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(USER_ID_HEADER, uid);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (existing !== uid) {
    response.cookies.set(USER_ID_COOKIE, uid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ONE_YEAR_SECONDS,
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals and static assets.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml|json|woff|woff2|ttf|otf|mp4|webm)$).*)',
  ],
};
