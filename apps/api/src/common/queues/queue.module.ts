import { Module, Global } from '@nestjs/common';
import { QueueConfigService } from './queue.config';

@Global()
@Module({
  providers: [QueueConfigService],
  exports: [QueueConfigService],
})
export class QueueModule {}
