import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@dryjets/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private currentTenantId: string | null = null;

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected successfully');

    // Initialize tenant isolation middleware
    this.initializeTenantIsolation();
  }

  /**
   * Set the current tenant ID for multi-tenant queries
   * This should be called per-request with the authenticated tenant
   */
  setTenantId(tenantId: string | null) {
    this.currentTenantId = tenantId;
  }

  /**
   * Get the current tenant ID
   */
  getTenantId(): string | null {
    return this.currentTenantId;
  }

  /**
   * Initialize Prisma middleware for tenant isolation
   */
  private initializeTenantIsolation() {
    // Middleware to automatically filter queries by tenantId for enterprise models
    this.$use(async (params, next) => {
      const tenantId = this.currentTenantId;

      // Only apply tenant filtering if tenantId is set
      if (tenantId) {
        // Models that need tenant isolation
        const tenantIsolatedModels = ['Branch', 'ApiLog'];

        if (tenantIsolatedModels.includes(params.model || '')) {
          // For query operations, add tenant filter
          if (params.action === 'findUnique' || params.action === 'findFirst') {
            params.args.where = {
              ...params.args.where,
              organization: {
                tenantId,
              },
            };
          } else if (params.action === 'findMany') {
            if (!params.args) {
              params.args = {};
            }
            params.args.where = {
              ...params.args.where,
              organization: {
                tenantId,
              },
            };
          } else if (params.action === 'count') {
            params.args.where = {
              ...params.args.where,
              organization: {
                tenantId,
              },
            };
          }
        }

        // For EnterpriseAccount queries, filter by tenantId directly
        if (params.model === 'EnterpriseAccount') {
          if (params.action === 'findUnique' || params.action === 'findFirst') {
            params.args.where = {
              ...params.args.where,
              tenantId,
            };
          } else if (params.action === 'findMany' || params.action === 'count') {
            if (!params.args) {
              params.args = {};
            }
            params.args.where = {
              ...params.args.where,
              tenantId,
            };
          }
        }
      }

      return next(params);
    });

    console.log('✅ Tenant isolation middleware initialized');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('👋 Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production!');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && key[0] !== '_'
    );

    return Promise.all(
      models.map((modelKey) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this as any)[modelKey].deleteMany();
      })
    );
  }
}
