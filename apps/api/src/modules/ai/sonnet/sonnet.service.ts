import { Injectable } from '@nestjs/common';

@Injectable()
export class SonnetService {
  async generateStructuredContent(prompt: string): Promise<any> {
    return { summary: 'Mock structured content response', prompt };
  }
}
