import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ApiKeyMiddleware } from '../../common/middleware/api-key.middleware';

@Module({
  imports: [PrismaModule],
  controllers: [EnterpriseController],
  providers: [EnterpriseService],
  exports: [EnterpriseService],
})
export class EnterpriseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply API key middleware to routes that should be protected
    // Exclude public routes like organization creation and API key validation
    consumer
      .apply(ApiKeyMiddleware)
      .exclude(
        { path: 'enterprise/organizations', method: RequestMethod.POST }, // Creating org is public
        { path: 'enterprise/validate-key', method: RequestMethod.POST }, // Validation endpoint is public
      )
      .forRoutes(
        { path: 'enterprise/organizations/:id', method: RequestMethod.GET },
        { path: 'enterprise/organizations/:id', method: RequestMethod.PATCH },
        { path: 'enterprise/organizations/:id/branches*', method: RequestMethod.ALL },
        { path: 'enterprise/organizations/:id/api-keys*', method: RequestMethod.ALL },
        { path: 'enterprise/organizations/:id/quota', method: RequestMethod.GET },
        { path: 'enterprise/organizations/:id/api-logs*', method: RequestMethod.ALL },
      );
  }
}
