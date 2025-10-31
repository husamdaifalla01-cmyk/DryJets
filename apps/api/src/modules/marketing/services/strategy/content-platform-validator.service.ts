import { Injectable, Logger } from '@nestjs/common';

/**
 * CONTENT-PLATFORM VALIDATOR SERVICE
 * 
 * Validates content suitability for specific platforms.
 * Ensures content meets platform requirements, best practices, and compliance.
 */

export interface ValidationResult {
  platform: string;
  isValid: boolean;
  score: number; // 0-100
  errors: { field: string; message: string }[];
  warnings: { field: string; message: string }[];
  suggestions: string[];
}

@Injectable()
export class ContentPlatformValidatorService {
  private readonly logger = new Logger(ContentPlatformValidatorService.name);

  /**
   * Validate content for a specific platform
   */
  async validateContent(content: {
    type: string;
    title?: string;
    body?: string;
    media?: any[];
    hashtags?: string[];
  }, platform: string): Promise<ValidationResult> {
    
    const validators = {
      twitter: this.validateTwitter,
      linkedin: this.validateLinkedIn,
      facebook: this.validateFacebook,
      instagram: this.validateInstagram,
      tiktok: this.validateTikTok,
      youtube: this.validateYouTube,
      blog: this.validateBlog,
    };

    const validator = validators[platform.toLowerCase()];
    
    if (!validator) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return validator.call(this, content);
  }

  private validateTwitter(content: any): ValidationResult {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    let score = 100;

    if (content.body?.length > 280) {
      errors.push({ field: 'body', message: 'Tweet exceeds 280 characters' });
      score -= 50;
    }

    if (!content.body || content.body.length < 10) {
      errors.push({ field: 'body', message: 'Tweet too short (minimum 10 characters)' });
      score -= 30;
    }

    if (content.hashtags && content.hashtags.length > 3) {
      warnings.push({ field: 'hashtags', message: 'More than 3 hashtags may reduce engagement' });
      score -= 10;
    }

    if (content.media && content.media.length > 4) {
      errors.push({ field: 'media', message: 'Twitter supports max 4 media items' });
      score -= 20;
    }

    suggestions.push('Add a hook in the first 20 characters');
    suggestions.push('Include a call-to-action');

    return {
      platform: 'twitter',
      isValid: errors.length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      suggestions,
    };
  }

  private validateLinkedIn(content: any): ValidationResult {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    let score = 100;

    if (content.body?.length > 3000) {
      errors.push({ field: 'body', message: 'LinkedIn post exceeds 3000 characters' });
      score -= 30;
    }

    if (content.body && content.body.length < 100) {
      warnings.push({ field: 'body', message: 'Short posts may have lower reach on LinkedIn' });
      score -= 10;
    }

    suggestions.push('Use professional tone');
    suggestions.push('Add industry insights');
    suggestions.push('Include relevant hashtags (3-5)');

    return {
      platform: 'linkedin',
      isValid: errors.length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      suggestions,
    };
  }

  private validateFacebook(content: any): ValidationResult {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    let score = 100;

    if (content.body?.length > 63206) {
      errors.push({ field: 'body', message: 'Facebook post exceeds character limit' });
      score -= 30;
    }

    suggestions.push('Keep posts under 200 characters for better engagement');
    suggestions.push('Use emojis strategically');
    suggestions.push('Ask questions to encourage comments');

    return {
      platform: 'facebook',
      isValid: errors.length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      suggestions,
    };
  }

  private validateInstagram(content: any): ValidationResult {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    let score = 100;

    if (!content.media || content.media.length === 0) {
      errors.push({ field: 'media', message: 'Instagram requires at least one image or video' });
      score -= 50;
    }

    if (content.body?.length > 2200) {
      errors.push({ field: 'body', message: 'Instagram caption exceeds 2200 characters' });
      score -= 20;
    }

    if (content.hashtags && content.hashtags.length > 30) {
      errors.push({ field: 'hashtags', message: 'Instagram allows max 30 hashtags' });
      score -= 15;
    }

    suggestions.push('Use 8-15 hashtags for optimal reach');
    suggestions.push('Include call-to-action in bio link');
    suggestions.push('Post at optimal times (analyze your audience)');

    return {
      platform: 'instagram',
      isValid: errors.length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      suggestions,
    };
  }

  private validateTikTok(content: any): ValidationResult {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    let score = 100;

    if (!content.media || content.media[0]?.type !== 'video') {
      errors.push({ field: 'media', message: 'TikTok requires video content' });
      score -= 60;
    }

    if (content.body?.length > 150) {
      warnings.push({ field: 'body', message: 'TikTok captions over 150 chars may be truncated' });
      score -= 10;
    }

    if (content.hashtags && content.hashtags.length > 5) {
      warnings.push({ field: 'hashtags', message: '3-5 hashtags work best on TikTok' });
      score -= 5;
    }

    suggestions.push('Hook viewers in first 3 seconds');
    suggestions.push('Use trending sounds');
    suggestions.push('Add captions to video');
    suggestions.push('Keep videos 15-60 seconds for best performance');

    return {
      platform: 'tiktok',
      isValid: errors.length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      suggestions,
    };
  }

  private validateYouTube(content: any): ValidationResult {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    let score = 100;

    if (!content.media || content.media[0]?.type !== 'video') {
      errors.push({ field: 'media', message: 'YouTube requires video content' });
      score -= 60;
    }

    if (!content.title || content.title.length > 100) {
      errors.push({ field: 'title', message: 'YouTube title must be 1-100 characters' });
      score -= 30;
    }

    if (content.body?.length > 5000) {
      warnings.push({ field: 'body', message: 'YouTube description over 5000 chars may be truncated' });
      score -= 10;
    }

    suggestions.push('Include keywords in title and description');
    suggestions.push('Create custom thumbnail');
    suggestions.push('Add timestamps in description');
    suggestions.push('Use 3-5 relevant tags');

    return {
      platform: 'youtube',
      isValid: errors.length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      suggestions,
    };
  }

  private validateBlog(content: any): ValidationResult {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    let score = 100;

    if (!content.title) {
      errors.push({ field: 'title', message: 'Blog post requires a title' });
      score -= 40;
    }

    if (!content.body || content.body.length < 300) {
      warnings.push({ field: 'body', message: 'Blog posts under 300 words may have poor SEO' });
      score -= 20;
    }

    if (content.body && content.body.length < 1000) {
      warnings.push({ field: 'body', message: 'Blog posts under 1000 words may rank lower in search' });
      score -= 10;
    }

    suggestions.push('Aim for 1500-2500 words for best SEO');
    suggestions.push('Include images (1 per 300 words)');
    suggestions.push('Add internal and external links');
    suggestions.push('Use H2 and H3 subheadings');
    suggestions.push('Include meta description (150-160 chars)');

    return {
      platform: 'blog',
      isValid: errors.length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Validate content for multiple platforms at once
   */
  async validateForMultiplePlatforms(content: any, platforms: string[]): Promise<ValidationResult[]> {
    return Promise.all(
      platforms.map(platform => this.validateContent(content, platform))
    );
  }

  /**
   * Get best platforms for content
   */
  async suggestBestPlatforms(content: any): Promise<{ platform: string; score: number }[]> {
    const platforms = ['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube', 'blog'];
    
    const validations = await Promise.all(
      platforms.map(async platform => {
        const result = await this.validateContent(content, platform);
        return { platform, score: result.score };
      })
    );

    return validations.sort((a, b) => b.score - a.score);
  }
}
