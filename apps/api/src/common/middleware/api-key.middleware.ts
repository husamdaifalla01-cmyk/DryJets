import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

/**
 * API Key Validation Middleware for Enterprise Endpoints
 *
 * Validates enterprise API keys and sets tenant context for multi-tenant isolation.
 *
 * Usage:
 * - Apply to routes that require enterprise API key authentication
 * - Expects API key in 'x-api-key' or 'Authorization: Bearer {key}' header
 * - Sets tenantId in PrismaService for automatic query filtering
 * - Attaches enterprise account info to request object
 */

export interface AuthenticatedRequest extends Request {
  enterpriseAccount?: {
    id: string;
    name: string;
    tenantId: string;
    userId: string;
    subscriptionPlan: string;
    monthlyQuota: number | null;
  };
}

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiKeyMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Extract API key from headers
      const apiKey = this.extractApiKey(req);

      if (!apiKey) {
        throw new UnauthorizedException('API key is required. Provide via x-api-key header or Authorization: Bearer token');
      }

      // Validate API key format (should start with 'ek_')
      if (!apiKey.startsWith('ek_')) {
        throw new UnauthorizedException('Invalid API key format');
      }

      // Lookup enterprise account by API key
      const enterpriseAccount = await this.prisma.enterpriseAccount.findUnique({
        where: { apiKey },
        select: {
          id: true,
          name: true,
          tenantId: true,
          userId: true,
          subscriptionPlan: true,
          monthlyQuota: true,
          subscription: {
            select: {
              status: true,
              currentPeriodEnd: true,
            },
          },
        },
      });

      if (!enterpriseAccount) {
        this.logger.warn(`Invalid API key attempt: ${apiKey.substring(0, 10)}...`);
        throw new UnauthorizedException('Invalid API key');
      }

      // Check subscription status
      if (enterpriseAccount.subscription) {
        if (enterpriseAccount.subscription.status !== 'ACTIVE') {
          throw new UnauthorizedException(
            `Enterprise subscription is ${enterpriseAccount.subscription.status.toLowerCase()}. Please update your billing information.`
          );
        }

        // Check if subscription has expired
        if (enterpriseAccount.subscription.currentPeriodEnd < new Date()) {
          throw new UnauthorizedException('Enterprise subscription has expired. Please renew your subscription.');
        }
      }

      // Set tenant context in PrismaService for automatic query filtering
      this.prisma.setTenantId(enterpriseAccount.tenantId);

      // Attach enterprise account to request for use in controllers
      req.enterpriseAccount = {
        id: enterpriseAccount.id,
        name: enterpriseAccount.name,
        tenantId: enterpriseAccount.tenantId,
        userId: enterpriseAccount.userId,
        subscriptionPlan: enterpriseAccount.subscriptionPlan,
        monthlyQuota: enterpriseAccount.monthlyQuota,
      };

      this.logger.log(`API request authenticated for tenant: ${enterpriseAccount.tenantId} (${enterpriseAccount.name})`);

      next();
    } catch (error) {
      // Clear tenant context on authentication failure
      this.prisma.setTenantId(null);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('API key validation error:', error);
      throw new UnauthorizedException('API key validation failed');
    }
  }

  /**
   * Extract API key from request headers
   * Supports both x-api-key header and Authorization: Bearer token
   */
  private extractApiKey(req: Request): string | null {
    // Check x-api-key header
    const xApiKey = req.headers['x-api-key'];
    if (xApiKey && typeof xApiKey === 'string') {
      return xApiKey;
    }

    // Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && typeof authHeader === 'string') {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1];
      }
    }

    return null;
  }
}
