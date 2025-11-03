import { Injectable } from '@nestjs/common';

@Injectable()
export class SonnetService {
  constructor() {}

  /**
   * FIX: Added generateStructuredContent() to satisfy all strategy service calls.
   * Temporary implementation to unblock build.
   */
  async generateStructuredContent(prompt: string): Promise<any> {
    return {
      content: `Generated structured content for: ${prompt}`,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'SonnetService',
      },
    };
  }
}
