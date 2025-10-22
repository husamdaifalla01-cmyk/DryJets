/**
 * Business Router
 *
 * tRPC router for business account operations.
 * Proxies requests to the NestJS API backend.
 */

import { z } from 'zod';
import { createTRPCRouter, businessProcedure, protectedProcedure } from '../trpc';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Business account router
 */
export const businessRouter = createTRPCRouter({
  /**
   * Get business account by user ID
   */
  getAccount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const response = await fetch(`${API_URL}/business-accounts/by-user/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch business account');
    }

    return response.json();
  }),

  /**
   * Create business account
   */
  createAccount: protectedProcedure
    .input(
      z.object({
        companyName: z.string().min(2),
        taxId: z.string().optional(),
        industry: z.enum([
          'HOTEL',
          'RESTAURANT',
          'SALON',
          'SPA',
          'GYM',
          'CLINIC',
          'OFFICE',
          'RETAIL',
          'OTHER',
        ]).optional(),
        billingEmail: z.string().email(),
        subscriptionTier: z.enum(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']).optional(),
        monthlySpendLimit: z.number().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(`${API_URL}/business-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...input,
          userId: ctx.session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create business account');
      }

      return response.json();
    }),

  /**
   * Get team members
   */
  getTeamMembers: businessProcedure
    .input(z.object({ businessId: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch(
        `${API_URL}/business-accounts/${input.businessId}/team`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      return response.json();
    }),

  /**
   * Invite team member
   */
  inviteTeamMember: businessProcedure
    .input(
      z.object({
        businessId: z.string(),
        email: z.string().email(),
        role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
        permissions: z
          .object({
            canPlaceOrders: z.boolean(),
            canViewInvoices: z.boolean(),
            canManageTeam: z.boolean(),
            canManageSettings: z.boolean(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await fetch(
        `${API_URL}/business-accounts/${input.businessId}/team/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: input.email,
            role: input.role,
            permissions: input.permissions,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to invite team member');
      }

      return response.json();
    }),

  /**
   * Get recurring orders
   */
  getRecurringOrders: businessProcedure
    .input(z.object({ businessId: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch(
        `${API_URL}/business-accounts/${input.businessId}/recurring-orders`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recurring orders');
      }

      return response.json();
    }),

  /**
   * Create recurring order
   */
  createRecurringOrder: businessProcedure
    .input(
      z.object({
        businessId: z.string(),
        frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']),
        dayOfWeek: z.number().min(0).max(6).optional(),
        dayOfMonth: z.number().min(1).max(31).optional(),
        pickupTime: z.string(),
        serviceType: z.string(),
        specialInstructions: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { businessId, ...data } = input;
      const response = await fetch(
        `${API_URL}/business-accounts/${businessId}/recurring-orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create recurring order');
      }

      return response.json();
    }),

  /**
   * Get account statistics
   */
  getStats: businessProcedure
    .input(z.object({ businessId: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch(
        `${API_URL}/business-accounts/${input.businessId}/stats`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      return response.json();
    }),
});
