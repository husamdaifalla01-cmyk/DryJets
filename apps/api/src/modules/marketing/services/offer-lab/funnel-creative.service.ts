import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';

export interface CreativeGenerationOptions {
  offerTitle: string;
  category: string[];
  headline: string;
  tone?: 'professional' | 'casual' | 'urgent' | 'friendly';
}

/**
 * Funnel creative generation service
 * Uses DALL-E 3 for hero images and social previews
 */
@Injectable()
export class FunnelCreativeService {
  private readonly logger = new Logger(FunnelCreativeService.name);
  private readonly storageDir = path.join(process.cwd(), 'storage', 'offer-lab', 'images');

  constructor(private readonly http: HttpService) {
    // Ensure storage directory exists
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Generate hero image for funnel
   */
  async generateHeroImage(options: CreativeGenerationOptions): Promise<string> {
    try {
      this.logger.log(`Generating hero image for: ${options.offerTitle}`);

      const prompt = this.buildImagePrompt(options);
      const imageUrl = await this.generateWithDALLE(prompt);

      // Download and save image locally
      const savedPath = await this.downloadAndSaveImage(imageUrl, 'hero');

      return savedPath;
    } catch (error) {
      this.logger.error(`Hero image generation error: ${error.message}`);
      // Return placeholder
      return this.getPlaceholderImage('hero');
    }
  }

  /**
   * Generate social preview image
   */
  async generateSocialPreview(options: CreativeGenerationOptions): Promise<string> {
    try {
      this.logger.log(`Generating social preview for: ${options.offerTitle}`);

      const prompt = this.buildSocialImagePrompt(options);
      const imageUrl = await this.generateWithDALLE(prompt, '1792x1024'); // Wide format

      const savedPath = await this.downloadAndSaveImage(imageUrl, 'social');

      return savedPath;
    } catch (error) {
      this.logger.error(`Social preview generation error: ${error.message}`);
      return this.getPlaceholderImage('social');
    }
  }

  /**
   * Build DALL-E prompt for hero image
   */
  private buildImagePrompt(options: CreativeGenerationOptions): string {
    const category = options.category[0] || 'general';
    const toneMap = {
      professional: 'clean, modern, minimalist, corporate',
      casual: 'friendly, warm, approachable, relaxed',
      urgent: 'bold, dramatic, high-energy, dynamic',
      friendly: 'inviting, cheerful, bright, welcoming',
    };

    const style = toneMap[options.tone] || toneMap.professional;

    return `A high-quality, professional landing page hero image for ${category}.
Style: ${style}, photorealistic, high resolution, web-optimized.
Theme: ${options.headline}.
No text, no logos, no people's faces (if possible), focus on concept and emotion.
Color palette: vibrant but not oversaturated, suitable for conversion-focused design.`;
  }

  /**
   * Build DALL-E prompt for social preview
   */
  private buildSocialImagePrompt(options: CreativeGenerationOptions): string {
    return `A compelling social media preview image for ${options.offerTitle}.
Style: eye-catching, professional, modern, clean design.
Format: landscape, suitable for Facebook/LinkedIn preview.
Theme: ${options.headline}.
No text overlay needed, focus on visual impact and emotional appeal.`;
  }

  /**
   * Generate image using DALL-E 3
   */
  private async generateWithDALLE(
    prompt: string,
    size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024',
  ): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.post(
          'https://api.openai.com/v1/images/generations',
          {
            model: 'dall-e-3',
            prompt,
            n: 1,
            size,
            quality: 'standard', // or 'hd' for higher quality
            style: 'natural', // or 'vivid' for more dramatic
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 60000, // DALL-E can take time
          },
        ),
      );

      return response.data.data[0].url;
    } catch (error) {
      this.logger.error(`DALL-E API error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Download image from URL and save locally
   */
  private async downloadAndSaveImage(imageUrl: string, prefix: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 30000,
        }),
      );

      const filename = `${prefix}_${Date.now()}.png`;
      const filepath = path.join(this.storageDir, filename);

      fs.writeFileSync(filepath, response.data);

      // Return relative path for storage in database
      return `/storage/offer-lab/images/${filename}`;
    } catch (error) {
      this.logger.error(`Image download error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get placeholder image path
   */
  private getPlaceholderImage(type: 'hero' | 'social'): string {
    // Return path to a generic placeholder
    // In production, you'd have actual placeholder images
    return `/storage/offer-lab/images/placeholder_${type}.png`;
  }

  /**
   * Generate multiple creative variations
   */
  async generateCreativeSet(options: CreativeGenerationOptions) {
    const [heroImage, socialPreview] = await Promise.allSettled([
      this.generateHeroImage(options),
      this.generateSocialPreview(options),
    ]);

    return {
      heroImage: heroImage.status === 'fulfilled' ? heroImage.value : this.getPlaceholderImage('hero'),
      socialPreview:
        socialPreview.status === 'fulfilled'
          ? socialPreview.value
          : this.getPlaceholderImage('social'),
    };
  }

  /**
   * Clean up old images (for maintenance)
   */
  async cleanupOldImages(daysOld: number = 30) {
    try {
      const files = fs.readdirSync(this.storageDir);
      const now = Date.now();
      const maxAge = daysOld * 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      for (const file of files) {
        const filepath = path.join(this.storageDir, file);
        const stats = fs.statSync(filepath);

        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filepath);
          deletedCount++;
        }
      }

      this.logger.log(`Cleaned up ${deletedCount} old images`);
      return { deletedCount };
    } catch (error) {
      this.logger.error(`Cleanup error: ${error.message}`);
      throw error;
    }
  }
}
