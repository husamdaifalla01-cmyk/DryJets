/**
 * tRPC Server Configuration
 *
 * This file sets up the tRPC server for the DryJets Unified Web Platform.
 * It provides type-safe API routes with end-to-end type safety between
 * the frontend and backend.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { type Session } from 'next-auth';
import superjson from 'superjson';
import { ZodError } from 'zod';

/**
 * Context for tRPC requests
 * Contains session information from NextAuth
 */
interface CreateContextOptions {
  session: Session | null;
}

/**
 * Inner context creation (for server-side use)
 */
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    session: opts.session,
  };
};

/**
 * Creates context for tRPC requests
 * This is called for every request and provides the session
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  session: Session | null;
}) => {
  return await createContextInner({
    session: opts.session,
  });
};

/**
 * Initialize tRPC with context
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      // Infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Business role procedure - requires BUSINESS role
 */
export const businessProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'BUSINESS' && ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This endpoint requires business account access'
    });
  }
  return next({ ctx });
});

/**
 * Enterprise role procedure - requires ENTERPRISE role
 */
export const enterpriseProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'ENTERPRISE' && ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This endpoint requires enterprise account access'
    });
  }
  return next({ ctx });
});

/**
 * Admin role procedure - requires ADMIN role
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This endpoint requires admin access'
    });
  }
  return next({ ctx });
});
