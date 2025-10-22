/**
 * NextAuth Configuration
 *
 * Authentication configuration for the DryJets Unified Web Platform.
 * Supports multiple providers and role-based access control.
 */

import { type NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from '@dryjets/database';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },

  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Fetch full user data including role
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
          },
        });

        if (user) {
          session.user.id = user.id;
          session.user.role = user.role;
          session.user.emailVerified = user.emailVerified;
        }
      }
      return session;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async redirect({ url, baseUrl }) {
      // Get user from database to check role
      if (url.includes('/auth/signin') || url.includes('/auth/callback')) {
        // Redirect based on user role after signin
        // This will be handled by middleware instead
        return baseUrl;
      }

      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    },
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', {
        userId: user.id,
        email: user.email,
        isNewUser,
        provider: account?.provider,
      });

      // Set default role for new users
      if (isNewUser && user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'CUSTOMER' },
        });
      }
    },
    async signOut({ session, token }) {
      console.log('User signed out:', {
        userId: token?.sub,
      });
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
