import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../common/prisma/prisma.service';
import { PermissionsService } from '../common/permissions/permissions.service';
import {
  Permission,
  PERMISSIONS_KEY,
  REQUIRE_ALL_KEY,
} from '../decorators/permissions.decorator';
import { CurrentUserData } from '../decorators/current-user.decorator';

/**
 * Permissions Guard
 * Phase 3: Enterprise Dashboard Architecture - RBAC
 *
 * Validates that the authenticated user (merchant staff) has the required
 * permissions to access a route.
 *
 * Usage:
 * ```typescript
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Permissions(Permission.VIEW_ORDERS)
 * @Get('orders')
 * async getOrders() {
 *   // Only users with VIEW_ORDERS permission can access this
 * }
 * ```
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from route metadata
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get the current user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserData;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admin users (platform level) have full access
    if (user.role === 'ADMIN') {
      return true;
    }

    // Only MERCHANT role users have staff permissions
    if (user.role !== 'MERCHANT') {
      throw new ForbiddenException('Access denied: Not a merchant user');
    }

    // Fetch staff info for merchant user
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId: user.id },
      include: {
        staff: {
          where: { isActive: true },
        },
      },
    });

    if (!merchant) {
      throw new ForbiddenException('Merchant not found');
    }

    // Find the staff record for this user (assuming user can be staff of their own merchant)
    // In a real implementation, you might have a separate staffUserId field
    const staffMember = merchant.staff[0];

    if (!staffMember) {
      throw new ForbiddenException('Staff record not found');
    }

    // Check if we need ALL permissions or ANY permission
    const requireAll = this.reflector.getAllAndOverride<boolean>(REQUIRE_ALL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Get staff permissions
    const hasAccess = requireAll
      ? await this.permissionsService.hasAllPermissions(staffMember.id, requiredPermissions)
      : await this.permissionsService.hasAnyPermission(staffMember.id, requiredPermissions);

    if (!hasAccess) {
      this.logger.warn(
        `Access denied for staff ${staffMember.id}: Required ${requireAll ? 'ALL' : 'ANY'} of [${requiredPermissions.join(', ')}]`,
      );
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    // Attach staff info to request for later use
    request.user.staffId = staffMember.id;
    request.user.merchantId = merchant.id;
    request.user.staffRole = staffMember.role;

    return true;
  }
}
