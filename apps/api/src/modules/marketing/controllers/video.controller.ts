import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { VideoScriptGeneratorService } from '../services/video/video-script-generator.service';
import { VideoMetadataOptimizerService } from '../services/video/video-metadata-optimizer.service';
import { PlatformFormatterService } from '../services/video/platform-formatter.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/v1/marketing/video')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(
    private readonly scriptGenerator: VideoScriptGeneratorService,
    private readonly metadataOptimizer: VideoMetadataOptimizerService,
    private readonly platformFormatter: PlatformFormatterService,
  ) {}

  /**
   * POST /api/v1/marketing/video/script/generate
   * Generate video script
   */
  @Post('script/generate')
  async generateScript(
    @Body()
    body: {
      topic?: string;
      blogPostId?: string;
      duration: number;
      platform: 'tiktok' | 'youtube' | 'instagram' | 'linkedin';
      style: 'TALKING_HEAD' | 'B_ROLL' | 'SLIDESHOW' | 'ANIMATION';
      tone?: 'professional' | 'casual' | 'humorous' | 'educational';
      campaignId?: string;
    },
  ) {
    const script = await this.scriptGenerator.generateScript({
      topic: body.topic,
      blogPostId: body.blogPostId,
      duration: body.duration,
      platform: body.platform,
      style: body.style,
      tone: body.tone,
    });

    // Save to database
    const scriptId = await this.scriptGenerator.saveScript(script, {
      topic: body.topic,
      blogPostId: body.blogPostId,
      duration: body.duration,
      platform: body.platform,
      style: body.style,
      tone: body.tone,
    }, body.campaignId);

    return {
      success: true,
      data: {
        ...script,
        scriptId,
      },
    };
  }

  /**
   * POST /api/v1/marketing/video/script/variations
   * Generate multiple script variations
   */
  @Post('script/variations')
  async generateScriptVariations(
    @Body()
    body: {
      topic?: string;
      blogPostId?: string;
      duration: number;
      platform: 'tiktok' | 'youtube' | 'instagram' | 'linkedin';
      style: 'TALKING_HEAD' | 'B_ROLL' | 'SLIDESHOW' | 'ANIMATION';
      count?: number;
    },
  ) {
    const scripts = await this.scriptGenerator.generateScriptVariations(
      {
        topic: body.topic,
        blogPostId: body.blogPostId,
        duration: body.duration,
        platform: body.platform,
        style: body.style,
      },
      body.count || 3,
    );

    return {
      success: true,
      data: scripts,
      count: scripts.length,
    };
  }

  /**
   * GET /api/v1/marketing/video/script/:id
   * Get script by ID
   */
  @Get('script/:id')
  async getScript(@Param('id') id: string) {
    const script = await this.scriptGenerator.getScript(id);
    return {
      success: true,
      data: script,
    };
  }

  /**
   * POST /api/v1/marketing/video/metadata/generate
   * Generate video metadata
   */
  @Post('metadata/generate')
  async generateMetadata(
    @Body()
    body: {
      scriptId?: string;
      topic?: string;
      platform: 'tiktok' | 'youtube' | 'instagram' | 'linkedin';
      keywords?: string[];
      targetAudience?: string;
    },
  ) {
    const metadata = await this.metadataOptimizer.generateMetadata({
      scriptId: body.scriptId,
      topic: body.topic,
      platform: body.platform,
      keywords: body.keywords,
      targetAudience: body.targetAudience,
    });

    // Save to database if scriptId provided
    if (body.scriptId) {
      await this.metadataOptimizer.saveMetadata(metadata, body.scriptId);
    }

    return {
      success: true,
      data: metadata,
    };
  }

  /**
   * POST /api/v1/marketing/video/metadata/variations
   * Generate multiple metadata variations for A/B testing
   */
  @Post('metadata/variations')
  async generateMetadataVariations(
    @Body()
    body: {
      scriptId?: string;
      topic?: string;
      platform: 'tiktok' | 'youtube' | 'instagram' | 'linkedin';
      keywords?: string[];
      targetAudience?: string;
      count?: number;
    },
  ) {
    const variations = await this.metadataOptimizer.generateMetadataVariations(
      {
        scriptId: body.scriptId,
        topic: body.topic,
        platform: body.platform,
        keywords: body.keywords,
        targetAudience: body.targetAudience,
      },
      body.count || 3,
    );

    return {
      success: true,
      data: variations,
      count: variations.length,
    };
  }

  /**
   * POST /api/v1/marketing/video/metadata/optimize-hashtags
   * Optimize hashtags based on trends
   */
  @Post('metadata/optimize-hashtags')
  async optimizeHashtags(
    @Body() body: { hashtags: string[]; platform: string },
  ) {
    const optimized = await this.metadataOptimizer.optimizeHashtags(
      body.hashtags,
      body.platform,
    );

    return {
      success: true,
      data: {
        original: body.hashtags,
        optimized,
        added: optimized.filter(h => !body.hashtags.includes(h)),
      },
    };
  }

  /**
   * GET /api/v1/marketing/video/metadata/:id
   * Get metadata by content asset ID
   */
  @Get('metadata/:id')
  async getMetadata(@Param('id') id: string) {
    const metadata = await this.metadataOptimizer.getMetadata(id);
    return {
      success: true,
      data: metadata,
    };
  }

  /**
   * GET /api/v1/marketing/video/formats
   * Get all platform format specifications
   */
  @Get('formats')
  async getAllFormats() {
    const formats = this.platformFormatter.getAllPlatformFormats();
    return {
      success: true,
      data: formats,
    };
  }

  /**
   * GET /api/v1/marketing/video/format/:platform
   * Get format specifications for specific platform
   */
  @Get('format/:platform')
  async getPlatformFormat(
    @Param('platform') platform: 'tiktok' | 'youtube' | 'instagram' | 'linkedin' | 'twitter',
    @Query('videoType') videoType?: 'feed' | 'story' | 'reel' | 'short' | 'standard',
    @Query('quality') quality?: 'low' | 'medium' | 'high' | 'max',
  ) {
    const format = this.platformFormatter.getPlatformFormat({
      platform,
      videoType,
      quality,
    });

    return {
      success: true,
      data: format,
    };
  }

  /**
   * POST /api/v1/marketing/video/format/ffmpeg
   * Generate FFmpeg command for video formatting
   */
  @Post('format/ffmpeg')
  async generateFFmpegCommand(
    @Body()
    body: {
      platform: 'tiktok' | 'youtube' | 'instagram' | 'linkedin' | 'twitter';
      videoType?: 'feed' | 'story' | 'reel' | 'short' | 'standard';
      quality?: 'low' | 'medium' | 'high' | 'max';
      inputFile: string;
      outputFile: string;
    },
  ) {
    const command = this.platformFormatter.generateFFmpegCommand(
      {
        platform: body.platform,
        videoType: body.videoType,
        quality: body.quality,
      },
      body.inputFile,
      body.outputFile,
    );

    return {
      success: true,
      data: {
        command,
        platform: body.platform,
        videoType: body.videoType,
      },
    };
  }

  /**
   * POST /api/v1/marketing/video/validate
   * Validate video meets platform requirements
   */
  @Post('validate')
  async validateVideo(
    @Body()
    body: {
      platform: string;
      videoType: string;
      duration: number;
      fileSize: number;
      width: number;
      height: number;
      format: string;
    },
  ) {
    const validation = await this.platformFormatter.validateVideo(
      body.platform,
      body.videoType,
      {
        duration: body.duration,
        fileSize: body.fileSize,
        width: body.width,
        height: body.height,
        format: body.format,
      },
    );

    return {
      success: validation.valid,
      data: validation,
    };
  }

  /**
   * POST /api/v1/marketing/video/complete
   * Generate complete video DNA (script + metadata + format specs)
   */
  @Post('complete')
  async generateCompleteVideoDNA(
    @Body()
    body: {
      topic?: string;
      blogPostId?: string;
      duration: number;
      platform: 'tiktok' | 'youtube' | 'instagram' | 'linkedin';
      style: 'TALKING_HEAD' | 'B_ROLL' | 'SLIDESHOW' | 'ANIMATION';
      tone?: 'professional' | 'casual' | 'humorous' | 'educational';
      keywords?: string[];
      targetAudience?: string;
      campaignId?: string;
    },
  ) {
    // Generate script
    const script = await this.scriptGenerator.generateScript({
      topic: body.topic,
      blogPostId: body.blogPostId,
      duration: body.duration,
      platform: body.platform,
      style: body.style,
      tone: body.tone,
    });

    // Save script
    const scriptId = await this.scriptGenerator.saveScript(
      script,
      {
        topic: body.topic,
        blogPostId: body.blogPostId,
        duration: body.duration,
        platform: body.platform,
        style: body.style,
        tone: body.tone,
      },
      body.campaignId,
    );

    // Generate metadata
    const metadata = await this.metadataOptimizer.generateMetadata({
      scriptId,
      platform: body.platform,
      keywords: body.keywords,
      targetAudience: body.targetAudience,
    });

    // Save metadata
    await this.metadataOptimizer.saveMetadata(metadata, scriptId);

    // Get format specifications
    const format = this.platformFormatter.getPlatformFormat({
      platform: body.platform,
      quality: 'high',
    });

    return {
      success: true,
      data: {
        scriptId,
        script,
        metadata,
        format,
        nextSteps: [
          '1. Record video following script',
          `2. Edit to ${format.specifications.resolution.width}x${format.specifications.resolution.height} (${format.specifications.aspectRatio})`,
          '3. Add captions and text overlays',
          '4. Upload to platform with provided metadata',
          '5. Track performance and iterate',
        ],
      },
    };
  }

  /**
   * GET /api/v1/marketing/video/stats
   * Get video DNA system statistics
   */
  @Get('stats')
  async getVideoStats() {
    return {
      success: true,
      data: {
        totalScriptsGenerated: 0,
        totalMetadataGenerated: 0,
        platformsSupported: 5,
        videoFormatsSupported: 8,
        averageScriptLength: 0,
        averageViralScore: 0,
      },
    };
  }
}
