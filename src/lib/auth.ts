/**
 * NextAuth v5 (next-auth@beta) configuration for Clayverse.
 *
 * Required packages (install separately):
 *   npm install @auth/prisma-adapter
 *   npm install bcryptjs @types/bcryptjs   (for production password hashing)
 */

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./db";

/**
 * Simple password comparison stub.
 * REPLACE WITH BCRYPT IN PRODUCTION:
 *   import bcrypt from "bcryptjs";
 *   return bcrypt.compare(plain, hashed);
 */
async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  // TODO: replace with: return bcrypt.compare(plain, hashed)
  // This stub does a direct comparison — only safe for development/demo
  return plain === hashed;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),

    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) return null;

          // Users created via OAuth have no password stored; block credentials login
          const storedHash = (user as Record<string, unknown>)["password"] as
            | string
            | undefined;
          if (!storedHash) return null;

          const valid = await verifyPassword(
            credentials.password as string,
            storedHash
          );
          if (!valid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch {
          // DB may not be running in dev — fail gracefully
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Fetch username from DB on first sign-in
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { username: true },
          });
          token.username = dbUser?.username ?? null;
        } catch {
          token.username = null;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as typeof session.user & { username?: string | null }).username =
          token.username as string | null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});
