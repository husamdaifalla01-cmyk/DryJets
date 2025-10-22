/**
 * Enterprise Router
 *
 * tRPC router for enterprise organization operations.
 * Proxies requests to the NestJS API backend with API key authentication.
 */

import { z } from 'zod';
import { createTRPCRouter, enterpriseProcedure, protectedProcedure } from '../trpc';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Enterprise router
 */
export const enterpriseRouter = createTRPCRouter({
  /**
   * Get enterprise organization by user ID
   */
  getOrganization: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const response = await fetch(
      `${API_URL}/enterprise/organizations/by-user/${userId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch enterprise organization');
    }

    return response.json();
  }),

  /**
   * Create enterprise organization
   */
  createOrganization: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        subscriptionPlan: z.enum(['STARTER', 'GROWTH', 'ENTERPRISE', 'CUSTOM']),
        monthlyQuota: z.number().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(`${API_URL}/enterprise/organizations`, {
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
        throw new Error('Failed to create enterprise organization');
      }

      return response.json();
    }),

  /**
   * Get branches for organization
   */
  getBranches: enterpriseProcedure
    .input(
      z.object({
        organizationId: z.string(),
        activeOnly: z.boolean().optional().default(true),
      })
    )
    .query(async ({ input, ctx }) => {
      // Get organization to extract API key
      const org = await fetch(
        `${API_URL}/enterprise/organizations/${input.organizationId}`
      ).then((r) => r.json());

      const response = await fetch(
        `${API_URL}/enterprise/organizations/${input.organizationId}/branches?activeOnly=${input.activeOnly}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': org.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }

      return response.json();
    }),

  /**
   * Create branch
   */
  createBranch: enterpriseProcedure
    .input(
      z.object({
        organizationId: z.string(),
        name: z.string().min(2),
        code: z.string().min(2).max(10),
        email: z.string().email(),
        phone: z.string(),
        address: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          zipCode: z.string(),
          country: z.string().default('US'),
        }),
        settings: z
          .object({
            acceptsOrders: z.boolean().default(true),
            businessHours: z.record(z.string()).optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { organizationId, ...branchData } = input;

      // Get organization to extract API key
      const org = await fetch(
        `${API_URL}/enterprise/organizations/${organizationId}`
      ).then((r) => r.json());

      const response = await fetch(
        `${API_URL}/enterprise/organizations/${organizationId}/branches`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': org.apiKey,
          },
          body: JSON.stringify({
            ...branchData,
            organizationId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create branch');
      }

      return response.json();
    }),

  /**
   * Update branch
   */
  updateBranch: enterpriseProcedure
    .input(
      z.object({
        organizationId: z.string(),
        branchId: z.string(),
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z
          .object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zipCode: z.string().optional(),
            country: z.string().optional(),
          })
          .optional(),
        settings: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { organizationId, branchId, ...updateData } = input;

      // Get organization to extract API key
      const org = await fetch(
        `${API_URL}/enterprise/organizations/${organizationId}`
      ).then((r) => r.json());

      const response = await fetch(
        `${API_URL}/enterprise/branches/${branchId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': org.apiKey,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update branch');
      }

      return response.json();
    }),

  /**
   * Activate/deactivate branch
   */
  toggleBranchStatus: enterpriseProcedure
    .input(
      z.object({
        organizationId: z.string(),
        branchId: z.string(),
        active: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const { organizationId, branchId, active } = input;

      // Get organization to extract API key
      const org = await fetch(
        `${API_URL}/enterprise/organizations/${organizationId}`
      ).then((r) => r.json());

      const endpoint = active ? 'activate' : 'deactivate';
      const response = await fetch(
        `${API_URL}/enterprise/branches/${branchId}/${endpoint}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': org.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${endpoint} branch`);
      }

      return response.json();
    }),

  /**
   * Regenerate API key
   */
  regenerateApiKey: enterpriseProcedure
    .input(z.object({ organizationId: z.string() }))
    .mutation(async ({ input }) => {
      const response = await fetch(
        `${API_URL}/enterprise/organizations/${input.organizationId}/regenerate-api-key`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to regenerate API key');
      }

      return response.json();
    }),

  /**
   * Get quota usage
   */
  getQuotaUsage: enterpriseProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      // Get organization to extract API key
      const org = await fetch(
        `${API_URL}/enterprise/organizations/${input.organizationId}`
      ).then((r) => r.json());

      const response = await fetch(
        `${API_URL}/enterprise/organizations/${input.organizationId}/quota`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': org.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch quota usage');
      }

      return response.json();
    }),

  /**
   * Get API logs
   */
  getApiLogs: enterpriseProcedure
    .input(
      z.object({
        organizationId: z.string(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ input }) => {
      // Get organization to extract API key
      const org = await fetch(
        `${API_URL}/enterprise/organizations/${input.organizationId}`
      ).then((r) => r.json());

      const response = await fetch(
        `${API_URL}/enterprise/organizations/${input.organizationId}/api-logs?page=${input.page}&limit=${input.limit}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': org.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch API logs');
      }

      return response.json();
    }),
});
