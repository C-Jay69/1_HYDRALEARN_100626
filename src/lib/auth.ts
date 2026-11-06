import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import { db } from './db';

// Local dev: NEXTAUTH_URL is usually unset and the dev port varies, so trust
// the request host. On Vercel, next-auth already derives the URL from the host
// (VERCEL=1). In other production hosts, set NEXTAUTH_URL explicitly.
if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV !== 'production') {
  process.env.AUTH_TRUST_HOST ??= 'true';
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const email = user.email?.toLowerCase();
      const verified =
        (profile as { email_verified?: boolean } | undefined)?.email_verified;
      return Boolean(email) && verified !== false;
    },
    async jwt({ token, user }) {
      // `user` is only present on the sign-in request: persist/lookup the
      // Prisma user once and keep its id in the JWT.
      if (user?.email) {
        const email = user.email.toLowerCase();
        const dbUser = await db.user.upsert({
          where: { email },
          update: user.name ? { name: user.name } : {},
          create: { email, name: user.name ?? null, role: 'STUDENT' },
        });
        token.uid = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        (session.user as { id?: string }).id = token.uid as string;
      }
      return session;
    },
  },
};

/** Prisma user id of the signed-in user, or null when signed out. */
export async function getSessionUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    const id = (session?.user as { id?: string } | undefined)?.id;
    return id ?? null;
  } catch {
    return null;
  }
}
