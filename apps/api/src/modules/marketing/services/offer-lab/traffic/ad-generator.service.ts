import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

/**
 * Ad Variant Generator Service
 *
 * Generates 3-5 ad variants per campaign with:
 * - Different headline angles (pain point, benefit, urgency, social proof, scarcity)
 * - Optimized for high CTR on pop traffic
 * - 300x250 banner images (DALL-E 3)
 */

export interface AdVariant {
  headline: string;
  description: string;
  callToAction: string;
  imageUrl?: string;
  angle: 'pain' | 'benefit' | 'urgency' | 'social-proof' | 'scarcity';
}

export interface AdGenerationOptions {
  offerTitle: string;
  offerCategory: string[];
  targetGeo: string;
  tone?: 'aggressive' | 'neutral' | 'soft';
  includeImages?: boolean;
}

@Injectable()
export class AdGeneratorService {
  private readonly logger = new Logger(AdGeneratorService.name);
  private readonly openai: OpenAI;
  private readonly isSandbox: boolean;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.isSandbox = this.configService.get<string>('OFFERLAB_SANDBOX_MODE') === 'true';

    if (apiKey && !this.isSandbox) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateVariants(options: AdGenerationOptions): Promise<AdVariant[]> {
    if (this.isSandbox || !this.openai) {
      return this.getMockVariants(options);
    }

    try {
      const variants: AdVariant[] = [];
      const angles: AdVariant['angle'][] = ['pain', 'benefit', 'urgency', 'social-proof', 'scarcity'];

      for (const angle of angles) {
        const variant = await this.generateVariant(options, angle);
        variants.push(variant);
      }

      this.logger.log(`Generated ${variants.length} ad variants for: ${options.offerTitle}`);
      return variants;
    } catch (error) {
      this.logger.error(`Ad generation failed: ${error.message}`);
      return this.getMockVariants(options);
    }
  }

  private async generateVariant(
    options: AdGenerationOptions,
    angle: AdVariant['angle'],
  ): Promise<AdVariant> {
    const tone = options.tone || 'neutral';
    const anglePrompts = {
      pain: 'Focus on the problem this offer solves. Make it relatable and urgent.',
      benefit: 'Focus on the transformation and positive outcome. What does the user gain?',
      urgency: 'Create time pressure. Limited availability, act now, don\'t miss out.',
      'social-proof': 'Emphasize that others are already benefiting. FOMO-driven.',
      scarcity: 'Limited spots, exclusive access, only for select people.',
    };

    const prompt = `You are a direct-response copywriter for pop traffic campaigns.

Offer: ${options.offerTitle}
Category: ${options.offerCategory.join(', ')}
Target Market: ${options.targetGeo}
Angle: ${angle} - ${anglePrompts[angle]}
Tone: ${tone}

Generate ad copy with:
1. Headline (max 60 characters, attention-grabbing, ${angle}-focused)
2. Description (max 120 characters, clear value proposition)
3. Call-to-Action (max 20 characters, action-oriented)

Format: JSON
{
  "headline": "...",
  "description": "...",
  "callToAction": "..."
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const content = JSON.parse(response.choices[0].message.content);

    let imageUrl: string | undefined;
    if (options.includeImages) {
      imageUrl = await this.generateAdImage(content.headline, options);
    }

    return {
      headline: content.headline,
      description: content.description,
      callToAction: content.callToAction,
      imageUrl,
      angle,
    };
  }

  private async generateAdImage(headline: string, options: AdGenerationOptions): Promise<string> {
    try {
      const imagePrompt = `Professional advertising banner for: ${headline}.
Style: Modern, clean, high-converting.
Category: ${options.offerCategory.join(', ')}.
No text in image. 300x250 banner dimensions.`;

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: imagePrompt,
        size: '1024x1024', // DALL-E 3 doesn't support 300x250, we'll resize
        quality: 'standard',
        n: 1,
      });

      return response.data[0].url;
    } catch (error) {
      this.logger.warn(`Image generation failed: ${error.message}`);
      return undefined;
    }
  }

  private getMockVariants(options: AdGenerationOptions): AdVariant[] {
    const base = options.offerTitle;

    return [
      {
        headline: `Stop Struggling With ${base}`,
        description: `Discover the proven solution that thousands are already using. Get started today!`,
        callToAction: 'Learn More',
        angle: 'pain',
      },
      {
        headline: `Transform Your Life With ${base}`,
        description: `Join successful people who made the switch. See results in days, not months.`,
        callToAction: 'Get Started',
        angle: 'benefit',
      },
      {
        headline: `${base} - Limited Time Offer`,
        description: `Don't miss out! This exclusive opportunity expires soon. Act now.`,
        callToAction: 'Claim Now',
        angle: 'urgency',
      },
      {
        headline: `10,000+ People Use ${base}`,
        description: `See why everyone is talking about this game-changing solution.`,
        callToAction: 'Join Now',
        angle: 'social-proof',
      },
      {
        headline: `Only 50 Spots Left for ${base}`,
        description: `Exclusive access for serious individuals only. Limited availability.`,
        callToAction: 'Reserve Spot',
        angle: 'scarcity',
      },
    ];
  }
}
