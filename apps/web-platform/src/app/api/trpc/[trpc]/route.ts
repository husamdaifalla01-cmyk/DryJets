/**
 * tRPC API Route Handler
 *
 * This file handles all tRPC requests through Next.js API routes.
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';
import { appRouter } from '@/server/routers/_app';
import { createTRPCContext } from '@/server/trpc';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth-options';

const handler = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        headers: req.headers,
        session,
      }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}:`,
              error.message
            );
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };
