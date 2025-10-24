import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { OrchestratorService } from './ai/orchestrator.service';
import { SonnetService } from './ai/sonnet.service';
import { PrismaModule } from '../../../src/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MarketingController],
  providers: [MarketingService, OrchestratorService, SonnetService],
  exports: [MarketingService, OrchestratorService],
})
export class MarketingModule {}
