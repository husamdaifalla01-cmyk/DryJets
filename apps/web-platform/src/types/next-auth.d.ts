/**
 * NextAuth Type Extensions
 *
 * Extends the default NextAuth types to include custom fields like role.
 */

import { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'CUSTOMER' | 'BUSINESS' | 'ENTERPRISE' | 'DRIVER' | 'MERCHANT' | 'ADMIN';
      emailVerified: Date | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: 'CUSTOMER' | 'BUSINESS' | 'ENTERPRISE' | 'DRIVER' | 'MERCHANT' | 'ADMIN';
    emailVerified: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'CUSTOMER' | 'BUSINESS' | 'ENTERPRISE' | 'DRIVER' | 'MERCHANT' | 'ADMIN';
  }
}
