import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../middleware/api-key.middleware';

/**
 * EnterpriseAccount Parameter Decorator
 *
 * Extracts the authenticated enterprise account from the request object.
 * Must be used on routes protected by ApiKeyMiddleware.
 *
 * @example
 * ```typescript
 * @Get('branches')
 * async getBranches(@EnterpriseAccount() account: any) {
 *   // account contains { id, name, tenantId, userId, subscriptionPlan, monthlyQuota }
 *   return this.service.findBranchesByTenant(account.tenantId);
 * }
 * ```
 */
export const EnterpriseAccount = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const account = request.enterpriseAccount;

    if (!account) {
      return null;
    }

    // If a specific property is requested, return only that
    return data ? account[data] : account;
  },
);
