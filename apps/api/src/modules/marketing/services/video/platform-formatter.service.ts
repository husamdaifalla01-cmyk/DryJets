import { Injectable, Logger } from '@nestjs/common';

export interface PlatformFormat {
  aspectRatio: string;
  resolution: { width: number; height: number };
  maxDuration: number; // seconds
  minDuration: number; // seconds
  maxFileSize: number; // MB
  formats: string[];
  frameRate: number;
  audioBitrate: number; // kbps
  videoBitrate: number; // kbps
}

export interface FormatRequest {
  platform: 'tiktok' | 'youtube' | 'instagram' | 'linkedin' | 'twitter';
  videoType?: 'feed' | 'story' | 'reel' | 'short' | 'standard';
  quality?: 'low' | 'medium' | 'high' | 'max';
}

export interface FormattedOutput {
  platform: string;
  videoType: string;
  specifications: PlatformFormat;
  exportSettings: ExportSettings;
  compressionSettings: CompressionSettings;
  platformRequirements: string[];
  optimizationTips: string[];
}

export interface ExportSettings {
  codec: string;
  container: string;
  colorSpace: string;
  audioCodec: string;
  audioChannels: number;
  sampleRate: number;
}

export interface CompressionSettings {
  crf: number; // Constant Rate Factor (0-51, lower = better quality)
  preset: string; // ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow
  tune: string; // film, animation, grain, stillimage, fastdecode, zerolatency
  targetBitrate?: number;
}

@Injectable()
export class PlatformFormatterService {
  private readonly logger = new Logger('PlatformFormatter');

  /**
   * Get platform-specific format specifications
   */
  getPlatformFormat(request: FormatRequest): FormattedOutput {
    this.logger.log(`Getting format specs for ${request.platform} ${request.videoType || 'standard'}...`);

    const platform = request.platform;
    const videoType = request.videoType || this.getDefaultVideoType(platform);
    const quality = request.quality || 'high';

    const specifications = this.getSpecifications(platform, videoType);
    const exportSettings = this.getExportSettings(platform, quality);
    const compressionSettings = this.getCompressionSettings(quality);
    const platformRequirements = this.getPlatformRequirements(platform, videoType);
    const optimizationTips = this.getOptimizationTips(platform, videoType);

    return {
      platform,
      videoType,
      specifications,
      exportSettings,
      compressionSettings,
      platformRequirements,
      optimizationTips,
    };
  }

  /**
   * Get default video type for platform
   */
  private getDefaultVideoType(platform: string): string {
    const defaults = {
      tiktok: 'feed',
      youtube: 'short',
      instagram: 'reel',
      linkedin: 'feed',
      twitter: 'feed',
    };

    return defaults[platform] || 'feed';
  }

  /**
   * Get platform specifications
   */
  private getSpecifications(platform: string, videoType: string): PlatformFormat {
    const specs: Record<string, Record<string, PlatformFormat>> = {
      tiktok: {
        feed: {
          aspectRatio: '9:16',
          resolution: { width: 1080, height: 1920 },
          maxDuration: 600, // 10 minutes
          minDuration: 1,
          maxFileSize: 287, // MB
          formats: ['MP4', 'MOV'],
          frameRate: 30,
          audioBitrate: 128,
          videoBitrate: 8000,
        },
      },
      youtube: {
        short: {
          aspectRatio: '9:16',
          resolution: { width: 1080, height: 1920 },
          maxDuration: 60,
          minDuration: 1,
          maxFileSize: 256,
          formats: ['MP4', 'MOV', 'AVI', 'FLV'],
          frameRate: 60,
          audioBitrate: 192,
          videoBitrate: 12000,
        },
        standard: {
          aspectRatio: '16:9',
          resolution: { width: 1920, height: 1080 },
          maxDuration: 43200, // 12 hours
          minDuration: 1,
          maxFileSize: 256000, // 256 GB
          formats: ['MP4', 'MOV', 'AVI', 'FLV', 'WMV'],
          frameRate: 60,
          audioBitrate: 192,
          videoBitrate: 16000,
        },
      },
      instagram: {
        reel: {
          aspectRatio: '9:16',
          resolution: { width: 1080, height: 1920 },
          maxDuration: 90,
          minDuration: 3,
          maxFileSize: 500,
          formats: ['MP4', 'MOV'],
          frameRate: 30,
          audioBitrate: 128,
          videoBitrate: 8000,
        },
        feed: {
          aspectRatio: '1:1',
          resolution: { width: 1080, height: 1080 },
          maxDuration: 60,
          minDuration: 3,
          maxFileSize: 500,
          formats: ['MP4', 'MOV'],
          frameRate: 30,
          audioBitrate: 128,
          videoBitrate: 8000,
        },
        story: {
          aspectRatio: '9:16',
          resolution: { width: 1080, height: 1920 },
          maxDuration: 60,
          minDuration: 1,
          maxFileSize: 500,
          formats: ['MP4', 'MOV'],
          frameRate: 30,
          audioBitrate: 128,
          videoBitrate: 6000,
        },
      },
      linkedin: {
        feed: {
          aspectRatio: '1:1',
          resolution: { width: 1080, height: 1080 },
          maxDuration: 600, // 10 minutes
          minDuration: 3,
          maxFileSize: 5000, // 5 GB
          formats: ['MP4', 'MOV', 'AVI'],
          frameRate: 30,
          audioBitrate: 128,
          videoBitrate: 10000,
        },
        story: {
          aspectRatio: '9:16',
          resolution: { width: 1080, height: 1920 },
          maxDuration: 20,
          minDuration: 1,
          maxFileSize: 500,
          formats: ['MP4', 'MOV'],
          frameRate: 30,
          audioBitrate: 128,
          videoBitrate: 8000,
        },
      },
      twitter: {
        feed: {
          aspectRatio: '16:9',
          resolution: { width: 1920, height: 1080 },
          maxDuration: 140,
          minDuration: 1,
          maxFileSize: 512,
          formats: ['MP4', 'MOV'],
          frameRate: 60,
          audioBitrate: 128,
          videoBitrate: 10000,
        },
      },
    };

    return specs[platform]?.[videoType] || specs.youtube.standard;
  }

  /**
   * Get export settings
   */
  private getExportSettings(platform: string, quality: string): ExportSettings {
    const baseSettings: ExportSettings = {
      codec: 'H.264',
      container: 'MP4',
      colorSpace: 'BT.709',
      audioCodec: 'AAC',
      audioChannels: 2,
      sampleRate: 48000,
    };

    // Platform-specific adjustments
    if (platform === 'youtube' && quality === 'max') {
      baseSettings.codec = 'H.265'; // HEVC for better compression
    }

    if (platform === 'tiktok' || platform === 'instagram') {
      baseSettings.colorSpace = 'BT.601'; // Mobile-optimized
    }

    return baseSettings;
  }

  /**
   * Get compression settings
   */
  private getCompressionSettings(quality: string): CompressionSettings {
    const settings = {
      low: {
        crf: 28,
        preset: 'veryfast',
        tune: 'zerolatency',
        targetBitrate: 2000,
      },
      medium: {
        crf: 23,
        preset: 'medium',
        tune: 'film',
        targetBitrate: 5000,
      },
      high: {
        crf: 18,
        preset: 'slow',
        tune: 'film',
        targetBitrate: 10000,
      },
      max: {
        crf: 15,
        preset: 'veryslow',
        tune: 'film',
        targetBitrate: 20000,
      },
    };

    return settings[quality] || settings.high;
  }

  /**
   * Get platform requirements
   */
  private getPlatformRequirements(platform: string, videoType: string): string[] {
    const requirements: Record<string, string[]> = {
      tiktok: [
        'Vertical format (9:16) is mandatory',
        'First 3 seconds must hook viewer',
        'Closed captions recommended (80% watch with sound off)',
        'Use TikTok-native fonts for on-screen text',
        'Trending sounds increase discoverability',
      ],
      youtube_short: [
        'Vertical format (9:16) required',
        'Max 60 seconds duration',
        'Must not have watermarks from other platforms',
        'Use #Shorts in title or description',
        'Hook viewers in first 1-2 seconds',
      ],
      youtube_standard: [
        'Horizontal format (16:9) recommended',
        'Custom thumbnail required (1280x720)',
        'Add chapters for videos >10 minutes',
        'Include timestamps in description',
        'End screen for last 5-20 seconds',
      ],
      instagram_reel: [
        'Vertical format (9:16) required',
        'Max 90 seconds, but 30s performs best',
        'Cover image should be frame 1',
        'Use Instagram fonts for text overlays',
        'Include trending audio',
      ],
      instagram_feed: [
        'Square format (1:1) or vertical (4:5)',
        'First frame is critical (thumbnail)',
        'Subtitles essential',
        'Max 60 seconds',
      ],
      linkedin: [
        'Square (1:1) or horizontal (16:9) for desktop viewing',
        'Professional content performs better',
        'Subtitles are critical',
        'First 2 seconds must clearly state value',
        'Native upload (not YouTube links)',
      ],
      twitter: [
        'Horizontal (16:9) or square (1:1)',
        'First second must grab attention',
        'Keep under 45 seconds for best engagement',
        'Subtitles required',
        'Optimize for mobile viewing',
      ],
    };

    const key = videoType ? `${platform}_${videoType}` : platform;
    return requirements[key] || requirements[platform] || [];
  }

  /**
   * Get optimization tips
   */
  private getOptimizationTips(platform: string, videoType: string): string[] {
    const tips: Record<string, string[]> = {
      tiktok: [
        'Use trending sounds to boost discoverability',
        'Add text overlays for key points',
        'End with a question or CTA to boost comments',
        'Post during peak hours: 6-10am, 7-11pm EST',
        'Engage with comments in first hour',
      ],
      youtube: [
        'Create custom thumbnail with 50% text, 50% image',
        'Use pattern interrupts every 8-10 seconds',
        'Include cards at 30s, 60s, and 90s',
        'Add end screen with subscribe prompt',
        'Target 8-10 minute length for ad revenue',
      ],
      instagram: [
        'Use latest trending audio',
        'Add stickers and GIFs for engagement',
        'Share to Stories for extra reach',
        'Post during peak hours: 11am-1pm, 7-9pm',
        'Use all 30 hashtags (10 in caption, 20 in comment)',
      ],
      linkedin: [
        'Start with a problem statement',
        'Provide actionable value',
        'End with industry question',
        'Post Tuesday-Thursday, 8-10am',
        'Tag relevant companies/people',
      ],
      twitter: [
        'Keep it punchy and fast-paced',
        'Use polls to boost engagement',
        'Thread your video with context',
        'Post during peak hours: 9am, 12pm, 5pm EST',
        'Retweet your own video after 3-4 hours',
      ],
    };

    return tips[platform] || [];
  }

  /**
   * Generate FFmpeg command for video formatting
   */
  generateFFmpegCommand(request: FormatRequest, inputFile: string, outputFile: string): string {
    const format = this.getPlatformFormat(request);
    const spec = format.specifications;
    const compression = format.compressionSettings;

    const filters: string[] = [];

    // Scale to platform resolution
    filters.push(`scale=${spec.resolution.width}:${spec.resolution.height}:force_original_aspect_ratio=decrease`);

    // Add padding if needed
    filters.push(`pad=${spec.resolution.width}:${spec.resolution.height}:(ow-iw)/2:(oh-ih)/2:black`);

    // Set frame rate
    filters.push(`fps=${spec.frameRate}`);

    const filterString = filters.join(',');

    const command = `ffmpeg -i "${inputFile}" \\
  -vf "${filterString}" \\
  -c:v libx264 \\
  -preset ${compression.preset} \\
  -crf ${compression.crf} \\
  -tune ${compression.tune} \\
  -maxrate ${spec.videoBitrate}k \\
  -bufsize ${spec.videoBitrate * 2}k \\
  -c:a aac \\
  -b:a ${spec.audioBitrate}k \\
  -ar 48000 \\
  -ac 2 \\
  -movflags +faststart \\
  -pix_fmt yuv420p \\
  "${outputFile}"`;

    return command;
  }

  /**
   * Get all platform formats comparison
   */
  getAllPlatformFormats(): Record<string, FormattedOutput> {
    const platforms: FormatRequest[] = [
      { platform: 'tiktok', videoType: 'feed' },
      { platform: 'youtube', videoType: 'short' },
      { platform: 'youtube', videoType: 'standard' },
      { platform: 'instagram', videoType: 'reel' },
      { platform: 'instagram', videoType: 'feed' },
      { platform: 'instagram', videoType: 'story' },
      { platform: 'linkedin', videoType: 'feed' },
      { platform: 'twitter', videoType: 'feed' },
    ];

    const formats: Record<string, FormattedOutput> = {};

    for (const request of platforms) {
      const key = request.videoType ? `${request.platform}_${request.videoType}` : request.platform;
      formats[key] = this.getPlatformFormat(request);
    }

    return formats;
  }

  /**
   * Validate video meets platform requirements
   */
  async validateVideo(
    platform: string,
    videoType: string,
    videoMetadata: {
      duration: number;
      fileSize: number; // MB
      width: number;
      height: number;
      format: string;
    },
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const spec = this.getSpecifications(platform, videoType);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check duration
    if (videoMetadata.duration > spec.maxDuration) {
      errors.push(`Video duration (${videoMetadata.duration}s) exceeds maximum (${spec.maxDuration}s)`);
    }
    if (videoMetadata.duration < spec.minDuration) {
      errors.push(`Video duration (${videoMetadata.duration}s) is below minimum (${spec.minDuration}s)`);
    }

    // Check file size
    if (videoMetadata.fileSize > spec.maxFileSize) {
      errors.push(`File size (${videoMetadata.fileSize}MB) exceeds maximum (${spec.maxFileSize}MB)`);
    }

    // Check format
    if (!spec.formats.includes(videoMetadata.format.toUpperCase())) {
      errors.push(`Format ${videoMetadata.format} not supported. Use: ${spec.formats.join(', ')}`);
    }

    // Check aspect ratio
    const actualAspectRatio = (videoMetadata.width / videoMetadata.height).toFixed(2);
    const [expectedW, expectedH] = spec.aspectRatio.split(':').map(Number);
    const expectedAspectRatio = (expectedW / expectedH).toFixed(2);

    if (actualAspectRatio !== expectedAspectRatio) {
      warnings.push(
        `Aspect ratio ${actualAspectRatio} doesn't match recommended ${spec.aspectRatio}. Video may be cropped.`,
      );
    }

    // Check resolution
    if (
      videoMetadata.width !== spec.resolution.width ||
      videoMetadata.height !== spec.resolution.height
    ) {
      warnings.push(
        `Resolution ${videoMetadata.width}x${videoMetadata.height} doesn't match recommended ${spec.resolution.width}x${spec.resolution.height}`,
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
