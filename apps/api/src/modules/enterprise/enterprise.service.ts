import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateEnterpriseAccountDto,
  UpdateEnterpriseAccountDto,
  CreateBranchDto,
  UpdateBranchDto,
} from './dto';
import * as crypto from 'crypto';

@Injectable()
export class EnterpriseService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate unique tenant ID
   */
  private generateTenantId(): string {
    return `tenant_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Generate API key
   */
  private generateApiKey(): string {
    return `ek_${crypto.randomBytes(24).toString('hex')}`;
  }

  /**
   * Create a new enterprise account
   */
  async create(createDto: CreateEnterpriseAccountDto) {
    // Check if user already has an enterprise account
    const existing = await this.prisma.enterpriseAccount.findUnique({
      where: { userId: createDto.userId },
    });

    if (existing) {
      throw new ConflictException('User already has an enterprise account');
    }

    const tenantId = this.generateTenantId();
    const apiKey = this.generateApiKey();

    return this.prisma.enterpriseAccount.create({
      data: {
        ...createDto,
        tenantId,
        apiKey,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get all enterprise accounts (admin only)
   */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.enterpriseAccount.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
            },
          },
          _count: {
            select: {
              branches: true,
              invoices: true,
              apiLogs: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.enterpriseAccount.count(),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get enterprise account by ID
   */
  async findOne(id: string) {
    const account = await this.prisma.enterpriseAccount.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
            status: true,
          },
        },
        branches: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        subscription: true,
        _count: {
          select: {
            invoices: true,
            apiLogs: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException(`Enterprise account #${id} not found`);
    }

    return account;
  }

  /**
   * Get enterprise account by user ID
   */
  async findByUserId(userId: string) {
    const account = await this.prisma.enterpriseAccount.findUnique({
      where: { userId },
      include: {
        branches: {
          where: { isActive: true },
        },
        subscription: true,
        _count: {
          select: {
            invoices: true,
            apiLogs: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Enterprise account not found for this user');
    }

    return account;
  }

  /**
   * Get enterprise account by tenant ID
   */
  async findByTenantId(tenantId: string) {
    const account = await this.prisma.enterpriseAccount.findUnique({
      where: { tenantId },
      include: {
        branches: {
          where: { isActive: true },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Enterprise account not found for this tenant');
    }

    return account;
  }

  /**
   * Update enterprise account
   */
  async update(id: string, updateDto: UpdateEnterpriseAccountDto) {
    await this.findOne(id); // Check existence

    return this.prisma.enterpriseAccount.update({
      where: { id },
      data: updateDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Delete enterprise account
   */
  async remove(id: string) {
    await this.findOne(id); // Check existence

    return this.prisma.enterpriseAccount.delete({
      where: { id },
    });
  }

  /**
   * Regenerate API key
   */
  async regenerateApiKey(id: string) {
    await this.findOne(id);

    const newApiKey = this.generateApiKey();

    return this.prisma.enterpriseAccount.update({
      where: { id },
      data: {
        apiKey: newApiKey,
      },
      select: {
        id: true,
        apiKey: true,
        apiKeyEnabled: true,
      },
    });
  }

  /**
   * Enable/disable API access
   */
  async toggleApiAccess(id: string, enabled: boolean) {
    await this.findOne(id);

    return this.prisma.enterpriseAccount.update({
      where: { id },
      data: {
        apiKeyEnabled: enabled,
      },
    });
  }

  /**
   * Validate API key
   */
  async validateApiKey(apiKey: string): Promise<{ valid: boolean; tenantId?: string; organizationId?: string }> {
    const account = await this.prisma.enterpriseAccount.findUnique({
      where: { apiKey },
    });

    if (!account || !account.apiKeyEnabled) {
      return { valid: false };
    }

    return {
      valid: true,
      tenantId: account.tenantId,
      organizationId: account.id,
    };
  }

  // ===== Branch Management =====

  /**
   * Create a new branch
   */
  async createBranch(createDto: CreateBranchDto) {
    const account = await this.findOne(createDto.organizationId);

    // Check branch limit based on subscription plan
    const branchCount = await this.prisma.branch.count({
      where: { organizationId: createDto.organizationId },
    });

    const limits = {
      STARTUP: 5,
      GROWTH: 20,
      ENTERPRISE: Infinity,
      CUSTOM: Infinity,
    };

    if (branchCount >= limits[account.subscriptionPlan]) {
      throw new BadRequestException(
        `Branch limit reached for ${account.subscriptionPlan} plan (${limits[account.subscriptionPlan]} branches)`
      );
    }

    // Check for duplicate branch code
    if (createDto.code) {
      const existing = await this.prisma.branch.findUnique({
        where: {
          organizationId_code: {
            organizationId: createDto.organizationId,
            code: createDto.code,
          },
        },
      });

      if (existing) {
        throw new ConflictException('Branch with this code already exists');
      }
    }

    return this.prisma.branch.create({
      data: createDto,
    });
  }

  /**
   * Get branches for an organization
   */
  async getBranches(organizationId: string, activeOnly: boolean = true) {
    await this.findOne(organizationId);

    return this.prisma.branch.findMany({
      where: {
        organizationId,
        ...(activeOnly && { isActive: true }),
      },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get branch by ID
   */
  async getBranch(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            tenantId: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch #${id} not found`);
    }

    return branch;
  }

  /**
   * Update branch
   */
  async updateBranch(id: string, updateDto: UpdateBranchDto) {
    await this.getBranch(id);

    return this.prisma.branch.update({
      where: { id },
      data: updateDto,
    });
  }

  /**
   * Deactivate branch
   */
  async deactivateBranch(id: string) {
    await this.getBranch(id);

    return this.prisma.branch.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Delete branch
   */
  async deleteBranch(id: string) {
    await this.getBranch(id);

    return this.prisma.branch.delete({
      where: { id },
    });
  }

  /**
   * Check monthly quota
   */
  async checkQuota(organizationId: string): Promise<{ withinQuota: boolean; used: number; limit: number | null }> {
    const account = await this.findOne(organizationId);

    if (!account.monthlyQuota) {
      return { withinQuota: true, used: 0, limit: null };
    }

    // Calculate current month's orders across all branches
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const orderCount = await this.prisma.order.count({
      where: {
        branch: {
          organizationId,
        },
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    return {
      withinQuota: orderCount < account.monthlyQuota,
      used: orderCount,
      limit: account.monthlyQuota,
    };
  }

  /**
   * Log API usage
   */
  async logApiUsage(
    organizationId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.apiLog.create({
      data: {
        organizationId,
        endpoint,
        method,
        statusCode,
        responseTime,
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * Get API usage logs
   */
  async getApiLogs(organizationId: string, page: number = 1, limit: number = 50) {
    await this.findOne(organizationId);

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.apiLog.findMany({
        where: { organizationId },
        skip,
        take: limit,
        orderBy: {
          timestamp: 'desc',
        },
      }),
      this.prisma.apiLog.count({
        where: { organizationId },
      }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
