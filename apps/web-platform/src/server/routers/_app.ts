/**
 * Root tRPC Router
 *
 * This is the main router that combines all sub-routers for the application.
 * Add new routers here as you create them.
 */

import { createTRPCRouter } from '../trpc';
import { businessRouter } from './business';
import { enterpriseRouter } from './enterprise';
import { ordersRouter } from './orders';

/**
 * Main application router
 * Combines all feature-specific routers
 */
export const appRouter = createTRPCRouter({
  business: businessRouter,
  enterprise: enterpriseRouter,
  orders: ordersRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
