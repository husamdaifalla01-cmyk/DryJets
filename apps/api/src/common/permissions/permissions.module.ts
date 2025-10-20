import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Permissions Module
 * Phase 3: Enterprise Dashboard Architecture - RBAC
 *
 * Provides permissions service for role-based access control
 */
@Module({
  imports: [PrismaModule],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
