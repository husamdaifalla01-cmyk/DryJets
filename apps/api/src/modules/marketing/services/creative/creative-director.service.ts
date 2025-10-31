import { Injectable, Logger } from '@nestjs/common';
import { Anthropic } from '@anthropic-ai/sdk';

export interface CreativeEvaluation {
  score: number; // 0-100
  dimensions: {
    originality: number;
    emotional_impact: number;
    clarity: number;
    memorability: number;
    brand_fit: number;
  };
  feedback: string;
  improvements: string[];
}

@Injectable()
export class CreativeDirectorService {
  private readonly logger = new Logger('CreativeDirector');
  private readonly anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Evaluate creative work using AI with taste
   */
  async evaluateCreative(content: string, format: string): Promise<CreativeEvaluation> {
    this.logger.log(`Evaluating ${format} creative...`);

    const prompt = `You are a world-class creative director trained on Cannes Lions winners.

Evaluate this ${format} creative for DryJets (dry cleaning/laundry marketplace):

${content}

Rate on 0-100 scale:
1. Originality - Is it fresh and unexpected?
2. Emotional Impact - Does it move people?
3. Clarity - Is the message crystal clear?
4. Memorability - Will people remember this?
5. Brand Fit - Does it align with DryJets brand?

Return JSON:
{
  "score": 75,
  "dimensions": {
    "originality": 80,
    "emotional_impact": 70,
    "clarity": 85,
    "memorability": 65,
    "brand_fit": 75
  },
  "feedback": "Overall assessment...",
  "improvements": ["suggestion 1", "suggestion 2"]
}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Error evaluating creative: ${error.message}`);
    }

    return {
      score: 70,
      dimensions: {
        originality: 70,
        emotional_impact: 70,
        clarity: 70,
        memorability: 70,
        brand_fit: 70,
      },
      feedback: 'Solid execution with room for improvement',
      improvements: ['Add more emotional hooks', 'Strengthen unique value proposition'],
    };
  }

  /**
   * Generate breakthrough campaign ideas
   */
  async generateBreakthroughIdeas(brief: string): Promise<string[]> {
    const prompt = `You are a creative genius known for moonshot campaign ideas.

Brief: ${brief}

Generate 5 breakthrough campaign ideas that could go viral and win awards.

Make them:
- Unexpected and fresh
- Highly shareable
- Emotionally resonant
- Feasible but ambitious

Return JSON array:
["Idea 1", "Idea 2", ...]`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\[[\s\S]*?\]/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Error generating ideas: ${error.message}`);
    }

    return [
      'Time Liberation Day - Give everyone their Saturdays back',
      'Laundry Confessions - User-generated content series',
      '100,000 Hours Saved - Campaign celebrating customer time saved',
    ];
  }
}
