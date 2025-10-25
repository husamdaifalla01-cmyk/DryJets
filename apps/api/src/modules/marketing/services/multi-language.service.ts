import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

interface TranslatedContent {
  original_language: string
  translated_language: string
  original_text: string
  translated_text: string
  confidence_score: number
  quality_rating: number
  timestamp: Date
}

interface LanguageConfig {
  code: string
  name: string
  native_name: string
  region: string
  rtl: boolean
  market_size_estimate: number
}

interface ContentOptimization {
  language: string
  optimized_content: string
  localization_notes: string[]
  cultural_adjustments: string[]
  emoji_recommendations: string[]
}

@Injectable()
export class MultiLanguageService {
  private readonly logger = new Logger('MultiLanguageService')
  private translationCache: Map<string, TranslatedContent> = new Map()
  private supportedLanguages: LanguageConfig[] = []

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.initializeSupportedLanguages()
  }

  /**
   * Initialize supported languages
   */
  private initializeSupportedLanguages(): void {
    try {
      this.supportedLanguages = [
        {
          code: 'en',
          name: 'English',
          native_name: 'English',
          region: 'US/UK',
          rtl: false,
          market_size_estimate: 1500000000,
        },
        {
          code: 'es',
          name: 'Spanish',
          native_name: 'Español',
          region: 'Spain/Latin America',
          rtl: false,
          market_size_estimate: 500000000,
        },
        {
          code: 'fr',
          name: 'French',
          native_name: 'Français',
          region: 'France/Africa',
          rtl: false,
          market_size_estimate: 350000000,
        },
        {
          code: 'de',
          name: 'German',
          native_name: 'Deutsch',
          region: 'Germany/Austria',
          rtl: false,
          market_size_estimate: 200000000,
        },
        {
          code: 'zh',
          name: 'Chinese (Simplified)',
          native_name: '中文',
          region: 'China',
          rtl: false,
          market_size_estimate: 1000000000,
        },
        {
          code: 'ja',
          name: 'Japanese',
          native_name: '日本語',
          region: 'Japan',
          rtl: false,
          market_size_estimate: 125000000,
        },
        {
          code: 'pt',
          name: 'Portuguese',
          native_name: 'Português',
          region: 'Portugal/Brazil',
          rtl: false,
          market_size_estimate: 250000000,
        },
        {
          code: 'ar',
          name: 'Arabic',
          native_name: 'العربية',
          region: 'Middle East/North Africa',
          rtl: true,
          market_size_estimate: 400000000,
        },
        {
          code: 'hi',
          name: 'Hindi',
          native_name: 'हिन्दी',
          region: 'India',
          rtl: false,
          market_size_estimate: 600000000,
        },
      ]

      this.logger.log(
        `Initialized ${this.supportedLanguages.length} supported languages`,
      )
    } catch (error: any) {
      this.logger.error(
        `Failed to initialize languages: ${error.message}`,
      )
    }
  }

  /**
   * Translate content using Claude API
   */
  async translateContent(
    text: string,
    targetLanguage: string,
    sourceLanguage: string = 'en',
  ): Promise<TranslatedContent> {
    try {
      // Check cache first
      const cacheKey = `${sourceLanguage}_${targetLanguage}_${text.slice(0, 50)}`
      const cached = this.translationCache.get(cacheKey)

      if (cached) {
        this.logger.log(`Used cached translation for ${targetLanguage}`)
        return cached
      }

      // Simulate translation (in production, would call Claude API)
      const translatedText = await this.performTranslation(
        text,
        targetLanguage,
        sourceLanguage,
      )

      const result: TranslatedContent = {
        original_language: sourceLanguage,
        translated_language: targetLanguage,
        original_text: text,
        translated_text: translatedText,
        confidence_score: 0.95,
        quality_rating: Math.floor(Math.random() * 2) + 4, // 4-5 rating
        timestamp: new Date(),
      }

      // Cache result
      this.translationCache.set(cacheKey, result)

      this.logger.log(
        `Translated content to ${targetLanguage} (confidence: ${result.confidence_score})`,
      )

      return result
    } catch (error: any) {
      this.logger.error(
        `Failed to translate content: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Perform actual translation (mock implementation)
   */
  private async performTranslation(
    text: string,
    targetLanguage: string,
    sourceLanguage: string,
  ): Promise<string> {
    // In production, this would call Claude API or a translation API
    // For now, return a mock translation

    const translations: Record<string, Record<string, string>> = {
      es: {
        'Hello World': '¡Hola Mundo!',
        'Welcome to our platform': 'Bienvenido a nuestra plataforma',
        'Check this out': 'Echa un vistazo a esto',
      },
      fr: {
        'Hello World': 'Bonjour le monde',
        'Welcome to our platform': 'Bienvenue sur notre plateforme',
        'Check this out': 'Regardez ceci',
      },
      de: {
        'Hello World': 'Hallo Welt',
        'Welcome to our platform': 'Willkommen auf unserer Plattform',
        'Check this out': 'Schau dir das an',
      },
    }

    if (
      translations[targetLanguage] &&
      translations[targetLanguage][text]
    ) {
      return translations[targetLanguage][text]
    }

    // Return mock translation
    return `[${targetLanguage.toUpperCase()}] ${text}`
  }

  /**
   * Optimize content for specific language and culture
   */
  async optimizeForLanguage(
    text: string,
    language: string,
    platform: string,
  ): Promise<ContentOptimization> {
    try {
      const languageConfig = this.supportedLanguages.find(
        (l) => l.code === language,
      )

      if (!languageConfig) {
        throw new Error(`Unsupported language: ${language}`)
      }

      const localizationNotes: string[] = []
      const culturalAdjustments: string[] = []
      const emojiRecommendations: string[] = []

      // Add language-specific notes
      if (languageConfig.rtl) {
        localizationNotes.push('Text direction is right-to-left')
        localizationNotes.push('UI layout may need adjustment')
      }

      // Cultural adjustments
      switch (language) {
        case 'ar':
          culturalAdjustments.push('Consider conservative tone for Middle Eastern audiences')
          culturalAdjustments.push('Use proper formal/informal Arabic variants')
          emojiRecommendations.push('🤝', '👨‍👩‍👧‍👦', '💼')
          break
        case 'ja':
          culturalAdjustments.push('Use polite and humble tone')
          culturalAdjustments.push('Avoid direct sales language')
          emojiRecommendations.push('🙏', '✨', '🎌')
          break
        case 'es':
          culturalAdjustments.push('Use warm and enthusiastic tone')
          culturalAdjustments.push('Consider regional variations')
          emojiRecommendations.push('¡', '😊', '🌟')
          break
        case 'zh':
          culturalAdjustments.push('Use formal business language')
          culturalAdjustments.push('Avoid political sensitivity')
          emojiRecommendations.push('🎉', '🚀', '💡')
          break
        default:
          culturalAdjustments.push('Adapt content to local customs and preferences')
          break
      }

      // Platform-specific optimization
      if (platform === 'twitter') {
        localizationNotes.push('Keep under character limit for language')
        localizationNotes.push('Use platform-specific hashtags for region')
      } else if (platform === 'tiktok') {
        localizationNotes.push('Use trending sounds from target region')
        localizationNotes.push('Include regional trending hashtags')
      }

      const optimization: ContentOptimization = {
        language,
        optimized_content: `[Optimized for ${languageConfig.name}] ${text}`,
        localization_notes: localizationNotes,
        cultural_adjustments: culturalAdjustments,
        emoji_recommendations: emojiRecommendations,
      }

      this.logger.log(`Optimized content for ${languageConfig.name}`)

      return optimization
    } catch (error: any) {
      this.logger.error(
        `Failed to optimize for language: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): LanguageConfig[] {
    return this.supportedLanguages
  }

  /**
   * Get language by code
   */
  getLanguage(code: string): LanguageConfig | undefined {
    return this.supportedLanguages.find((l) => l.code === code)
  }

  /**
   * Get recommended languages based on market potential
   */
  getRecommendedLanguages(
    limit: number = 5,
  ): LanguageConfig[] {
    return this.supportedLanguages
      .sort((a, b) => b.market_size_estimate - a.market_size_estimate)
      .slice(0, limit)
  }

  /**
   * Translate content to multiple languages
   */
  async translateToMultiple(
    text: string,
    languages: string[],
  ): Promise<TranslatedContent[]> {
    try {
      const translations = await Promise.all(
        languages.map((lang) =>
          this.translateContent(text, lang, 'en'),
        ),
      )

      this.logger.log(`Translated content to ${languages.length} languages`)

      return translations
    } catch (error: any) {
      this.logger.error(
        `Failed to translate to multiple languages: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Get translation statistics
   */
  getStatistics(): {
    total_translations: number
    languages_used: string[]
    cache_size: number
    average_quality: number
  } {
    try {
      const translations = Array.from(this.translationCache.values())
      const languages = new Set(
        translations.map((t) => t.translated_language),
      )

      const avgQuality =
        translations.length > 0
          ? translations.reduce((sum, t) => sum + t.quality_rating, 0) /
            translations.length
          : 0

      return {
        total_translations: translations.length,
        languages_used: Array.from(languages),
        cache_size: this.translationCache.size,
        average_quality: Math.round(avgQuality * 100) / 100,
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to get statistics: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Detect language of content
   */
  async detectLanguage(text: string): Promise<{
    detected_language: string
    confidence: number
    alternative_languages: Array<{ language: string; confidence: number }>
  }> {
    try {
      // Mock language detection
      const mainLanguage = text.includes('¡') || text.includes('¿') ? 'es' : 'en'
      const confidence = Math.random() * 0.3 + 0.7 // 0.7-1.0

      return {
        detected_language: mainLanguage,
        confidence,
        alternative_languages: [
          { language: 'en', confidence: Math.random() * 0.2 },
          { language: 'es', confidence: Math.random() * 0.2 },
        ],
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to detect language: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Get localization guide for platform
   */
  getLocalizationGuide(
    platform: string,
    language: string,
  ): {
    platform: string
    language: string
    character_limits: Record<string, number>
    best_practices: string[]
    cultural_considerations: string[]
    example_content: string
  } {
    try {
      const languageConfig = this.getLanguage(language)

      if (!languageConfig) {
        throw new Error(`Unsupported language: ${language}`)
      }

      const guides: Record<string, Record<string, any>> = {
        twitter: {
          character_limits: {
            tweet: 280,
            thread: 5000,
          },
          best_practices: [
            'Use trending local hashtags',
            'Keep language simple and engaging',
            'Post during local peak hours',
          ],
          cultural_considerations: [
            'Respect local holidays',
            'Avoid controversial topics',
            'Use local currency references if needed',
          ],
        },
        instagram: {
          character_limits: {
            caption: 2200,
            hashtags: 30,
          },
          best_practices: [
            'Use relevant local hashtags',
            'Post during local engagement hours',
            'Engage with local influencers',
          ],
          cultural_considerations: [
            'Adapt visual content to cultural preferences',
            'Use locally appropriate emojis',
            'Feature local success stories',
          ],
        },
        tiktok: {
          character_limits: {
            caption: 2200,
            hashtags: 20,
          },
          best_practices: [
            'Use trending local sounds',
            'Follow local content trends',
            'Collaborate with local creators',
          ],
          cultural_considerations: [
            'Understand local humor and memes',
            'Respect local sensitivities',
            'Engage with local communities',
          ],
        },
      }

      const platformGuide = guides[platform] || guides['twitter']

      return {
        platform,
        language,
        character_limits: platformGuide.character_limits,
        best_practices: platformGuide.best_practices,
        cultural_considerations: platformGuide.cultural_considerations,
        example_content: `Sample content for ${languageConfig.name}`,
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to get localization guide: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Clear translation cache
   */
  clearCache(): number {
    const size = this.translationCache.size
    this.translationCache.clear()
    this.logger.log(`Cleared translation cache (${size} items)`)
    return size
  }
}
