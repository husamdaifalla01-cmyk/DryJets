/**
 * Orders Router
 *
 * tRPC router for order operations across all user types.
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Orders router
 */
export const ordersRouter = createTRPCRouter({
  /**
   * Get user's orders
   */
  getMyOrders: protectedProcedure
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const queryParams = new URLSearchParams({
        page: input.page.toString(),
        limit: input.limit.toString(),
        ...(input.status && { status: input.status }),
      });

      const response = await fetch(
        `${API_URL}/orders/user/${userId}?${queryParams}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      return response.json();
    }),

  /**
   * Get single order by ID
   */
  getOrder: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch(`${API_URL}/orders/${input.orderId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      return response.json();
    }),

  /**
   * Create new order
   */
  createOrder: protectedProcedure
    .input(
      z.object({
        serviceType: z.string(),
        pickupAddress: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          zipCode: z.string(),
        }),
        deliveryAddress: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          zipCode: z.string(),
        }),
        pickupDate: z.string(),
        items: z.array(
          z.object({
            name: z.string(),
            quantity: z.number().positive(),
            specialInstructions: z.string().optional(),
          })
        ),
        specialInstructions: z.string().optional(),
        businessId: z.string().optional(),
        branchId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...input,
          customerId: input.businessId || input.branchId ? undefined : ctx.session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return response.json();
    }),

  /**
   * Cancel order
   */
  cancelOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await fetch(
        `${API_URL}/orders/${input.orderId}/cancel`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: input.reason }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      return response.json();
    }),
});
