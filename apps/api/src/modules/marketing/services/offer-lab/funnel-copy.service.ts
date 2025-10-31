import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface CopyGenerationOptions {
  offerTitle: string;
  offerDescription: string;
  category: string[];
  payout: number;
  targetGeo?: string;
  tone?: 'professional' | 'casual' | 'urgent' | 'friendly';
  length?: 'short' | 'medium' | 'long';
}

export interface GeneratedCopy {
  headline: string;
  subheadline: string;
  bodyContent: string; // HTML
  ctaText: string;
  fleschScore: number;
}

/**
 * Funnel copy generation service
 * Uses Claude 3 for long-form content and GPT-4o for headlines
 */
@Injectable()
export class FunnelCopyService {
  private readonly logger = new Logger(FunnelCopyService.name);

  constructor(private readonly http: HttpService) {}

  /**
   * Generate complete funnel copy using AI
   */
  async generateCopy(options: CopyGenerationOptions): Promise<GeneratedCopy> {
    try {
      this.logger.log(`Generating copy for: ${options.offerTitle}`);

      // Generate headline using GPT-4o (better for short, punchy copy)
      const { headline, subheadline, ctaText } = await this.generateHeadlines(options);

      // Generate body content using Claude (better for structured long-form)
      const bodyContent = await this.generateBodyContent(options, headline);

      // Calculate Flesch reading ease score
      const fleschScore = this.calculateFleschScore(bodyContent);

      return {
        headline,
        subheadline,
        bodyContent,
        ctaText,
        fleschScore,
      };
    } catch (error) {
      this.logger.error(`Copy generation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate headlines and CTA using GPT-4o
   */
  private async generateHeadlines(options: CopyGenerationOptions) {
    const prompt = `Generate 3 headline variations for an affiliate offer landing page.

Offer: ${options.offerTitle}
Description: ${options.offerDescription}
Category: ${options.category.join(', ')}
Tone: ${options.tone || 'professional'}
Target: ${options.targetGeo || 'US'}

Requirements:
- Headline 1: Benefit-driven (focus on outcome)
- Headline 2: Curiosity-driven (create intrigue)
- Headline 3: Scarcity/urgency-driven (time-sensitive)
- Also provide a subheadline and CTA button text
- Keep headlines under 80 characters
- Make them conversion-optimized

Return as JSON:
{
  "headline1": "...",
  "headline2": "...",
  "headline3": "...",
  "subheadline": "...",
  "ctaText": "..."
}`;

    try {
      const response = await firstValueFrom(
        this.http.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert direct-response copywriter specializing in high-converting landing pages.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.8,
            max_tokens: 500,
            response_format: { type: 'json_object' },
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      const result = JSON.parse(response.data.choices[0].message.content);

      // Pick best headline (benefit-driven by default)
      return {
        headline: result.headline1 || result.headline,
        subheadline: result.subheadline,
        ctaText: result.ctaText || 'Get Started Now',
      };
    } catch (error) {
      this.logger.error(`GPT-4o API error: ${error.message}`);
      // Fallback to generic copy
      return {
        headline: `Discover ${options.offerTitle}`,
        subheadline: `${options.offerDescription}`,
        ctaText: 'Get Started Now',
      };
    }
  }

  /**
   * Generate AIDA-structured body content using Claude
   */
  private async generateBodyContent(
    options: CopyGenerationOptions,
    headline: string,
  ): Promise<string> {
    const wordCount = options.length === 'short' ? 200 : options.length === 'long' ? 600 : 400;

    const prompt = `Write persuasive landing page copy following the AIDA framework.

Headline: ${headline}
Offer: ${options.offerTitle}
Description: ${options.offerDescription}
Category: ${options.category.join(', ')}
Payout: $${options.payout}
Tone: ${options.tone || 'professional'}
Target length: ${wordCount} words

Structure (AIDA):
1. Attention: Hook the reader with the problem
2. Interest: Build interest by showing understanding
3. Desire: Create desire by painting the solution
4. Action: Drive to the CTA

Requirements:
- Write in HTML format with proper tags (<h2>, <p>, <ul>, etc.)
- Use persuasive, benefit-driven language
- Include social proof hints (e.g., "Join thousands of satisfied users")
- Keep Flesch reading ease above 60 (conversational)
- Focus on transformation, not features
- End with urgency
- NO generic phrases or clichés

Return clean HTML (no markdown, no code blocks).`;

    try {
      const response = await firstValueFrom(
        this.http.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          },
          {
            headers: {
              'x-api-key': process.env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      let content = response.data.content[0].text;

      // Clean up response (remove markdown code blocks if present)
      content = content.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

      return content;
    } catch (error) {
      this.logger.error(`Claude API error: ${error.message}`);
      // Fallback to basic template
      return this.generateFallbackContent(options, headline);
    }
  }

  /**
   * Generate fallback content if AI fails
   */
  private generateFallbackContent(options: CopyGenerationOptions, headline: string): string {
    return `
<h2>Transform Your Life Today</h2>
<p>Are you tired of struggling with ${options.category[0]}? ${headline}</p>

<h3>Why Choose This Solution?</h3>
<ul>
  <li>Proven results backed by thousands of satisfied customers</li>
  <li>Easy to implement, even if you're a complete beginner</li>
  <li>Guaranteed to deliver results or your money back</li>
</ul>

<h3>What You'll Get</h3>
<p>${options.offerDescription}</p>

<p><strong>Don't wait! This exclusive offer won't last forever.</strong></p>
    `.trim();
  }

  /**
   * Calculate Flesch Reading Ease score
   * Formula: 206.835 - 1.015(total words/total sentences) - 84.6(total syllables/total words)
   * Score > 60 is considered conversational/easy to read
   */
  private calculateFleschScore(text: string): number {
    try {
      // Remove HTML tags
      const plainText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      // Count sentences (approximate)
      const sentences = plainText.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

      // Count words
      const words = plainText.split(/\s+/).filter((w) => w.length > 0).length;

      // Count syllables (simplified approximation)
      const syllables = this.countSyllables(plainText);

      // Calculate Flesch score
      const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);

      return Math.round(Math.max(0, Math.min(100, score)));
    } catch (error) {
      return 60; // Default mid-range score
    }
  }

  /**
   * Count syllables in text (simplified approximation)
   */
  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;

    for (const word of words) {
      // Remove non-letters
      const cleaned = word.replace(/[^a-z]/g, '');
      if (cleaned.length === 0) continue;

      // Count vowel groups
      const vowelGroups = cleaned.match(/[aeiouy]+/g);
      count += vowelGroups ? vowelGroups.length : 1;

      // Adjust for silent 'e'
      if (cleaned.endsWith('e')) {
        count--;
      }

      // Minimum 1 syllable per word
      if (count < 1) count = 1;
    }

    return count;
  }
}
