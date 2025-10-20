import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Current User Type with Merchant Staff Info
 * Phase 3: Enterprise Dashboard Architecture
 */
export interface CurrentUserData {
  id: string;
  email: string;
  role: string;
  status: string;
  merchantId?: string;
  staffId?: string;
  staffRole?: string;
  permissions?: string[];
  locationId?: string | null; // null = all locations
}

/**
 * Decorator to inject the current authenticated user into the controller
 *
 * @example
 * ```typescript
 * @Get('profile')
 * async getProfile(@CurrentUser() user: CurrentUserData) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
