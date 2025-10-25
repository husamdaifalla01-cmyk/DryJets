import { Injectable, Logger } from '@nestjs/common'

interface LibraryContent {
  id: string
  title: string
  description: string
  type: 'image' | 'video' | 'template' | 'text' | 'document'
  category: string
  tags: string[]
  platforms: string[]
  content_data: any
  created_at: Date
  updated_at: Date
  usage_count: number
  is_favorite: boolean
  file_size?: number
  dimensions?: { width: number; height: number }
}

interface ContentFolder {
  id: string
  name: string
  description: string
  parent_id?: string
  items: string[] // IDs of content items
  created_at: Date
  updated_at: Date
}

interface ContentTemplate {
  id: string
  name: string
  platform: string
  category: string
  content_structure: Record<string, any>
  best_practices: string[]
  example_content: string
}

@Injectable()
export class ContentLibraryService {
  private readonly logger = new Logger('ContentLibraryService')
  private contentItems: Map<string, LibraryContent> = new Map()
  private folders: Map<string, ContentFolder> = new Map()
  private templates: Map<string, ContentTemplate> = new Map()
  private searchIndex: Map<string, Set<string>> = new Map()

  constructor() {
    this.initializeLibrary()
  }

  /**
   * Initialize library with sample content and templates
   */
  private initializeLibrary(): void {
    try {
      // Initialize folders
      const rootFolder: ContentFolder = {
        id: 'folder_root',
        name: 'Content Library',
        description: 'Root folder for all content',
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
      }

      this.folders.set('folder_root', rootFolder)

      // Initialize templates
      this.initializeTemplates()

      this.logger.log('Content library initialized successfully')
    } catch (error: any) {
      this.logger.error(
        `Failed to initialize content library: ${error.message}`,
      )
    }
  }

  /**
   * Initialize content templates
   */
  private initializeTemplates(): void {
    const templates: ContentTemplate[] = [
      {
        id: 'template_twitter_thread',
        name: 'Twitter Thread Template',
        platform: 'twitter',
        category: 'Educational',
        content_structure: {
          hook: 'Attention-grabbing opening (max 280 chars)',
          body: 'Array of tweets (max 10)',
          cta: 'Call-to-action tweet',
        },
        best_practices: [
          'Start with a hook that makes readers want to click',
          'Number each tweet for clarity',
          'Use visual breaks between tweets',
          'End with a clear call-to-action',
        ],
        example_content:
          'Building a successful marketing strategy? Here are 5 steps most businesses miss...',
      },
      {
        id: 'template_linkedin_article',
        name: 'LinkedIn Article Template',
        platform: 'linkedin',
        category: 'Thought Leadership',
        content_structure: {
          headline: 'Compelling headline (60 chars max)',
          subheading: 'Context and value proposition',
          body: 'Main content (2000+ words ideal)',
          conclusion: 'Summary and call-to-action',
        },
        best_practices: [
          'Use compelling statistics and data',
          'Format with short paragraphs and headers',
          'Include personal experience and insights',
          'End with actionable takeaways',
        ],
        example_content:
          'What I Learned Building a Billion-Dollar Marketing Strategy',
      },
      {
        id: 'template_instagram_carousel',
        name: 'Instagram Carousel Post',
        platform: 'instagram',
        category: 'Visual',
        content_structure: {
          slides: 'Array of 3-10 slides',
          caption: 'Engaging caption (2200 chars)',
          hashtags: 'Relevant hashtags (max 30)',
          cta: 'Call-to-action in caption',
        },
        best_practices: [
          'First slide must be eye-catching',
          'Maintain consistent style across slides',
          'Use text overlays strategically',
          'Include value in each slide',
        ],
        example_content: '5 Tips for Social Media Marketing Success',
      },
      {
        id: 'template_tiktok_viral',
        name: 'TikTok Viral Content',
        platform: 'tiktok',
        category: 'Entertainment',
        content_structure: {
          hook: 'First 3 seconds must grab attention',
          content: 'Main message (15-60 seconds)',
          trending_audio: 'Use trending sounds',
          hashtags: 'Mix popular and niche hashtags',
        },
        best_practices: [
          'Hook viewers in first 3 seconds',
          'Use trending sounds and effects',
          'Vertical video format (9:16)',
          'Authentic and relatable content',
        ],
        example_content: 'Day in the Life of a Content Creator',
      },
      {
        id: 'template_youtube_short',
        name: 'YouTube Short Template',
        platform: 'youtube',
        category: 'Short-form',
        content_structure: {
          title: 'Descriptive title (max 100 chars)',
          description: 'Context and links (max 5000)',
          duration: '15-60 seconds',
          tags: 'Relevant video tags',
        },
        best_practices: [
          'Vertical or square format',
          'Optimize for mobile viewing',
          'Include text overlays',
          'Strong thumbnail for click-through',
        ],
        example_content: 'Quick Marketing Tips Nobody Tells You',
      },
    ]

    templates.forEach((template) => {
      this.templates.set(template.id, template)
    })

    this.logger.log(`Initialized ${templates.length} content templates`)
  }

  /**
   * Upload content to library
   */
  async uploadContent(content: Omit<LibraryContent, 'id' | 'created_at' | 'updated_at' | 'usage_count'>): Promise<LibraryContent> {
    try {
      const id = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const libraryContent: LibraryContent = {
        ...content,
        id,
        created_at: new Date(),
        updated_at: new Date(),
        usage_count: 0,
      }

      this.contentItems.set(id, libraryContent)

      // Add to search index
      this.indexContent(libraryContent)

      this.logger.log(`Uploaded content: ${libraryContent.title} (${id})`)

      return libraryContent
    } catch (error: any) {
      this.logger.error(
        `Failed to upload content: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Add content to search index
   */
  private indexContent(content: LibraryContent): void {
    const searchTerms = [
      content.title.toLowerCase(),
      content.category.toLowerCase(),
      ...content.tags.map((t) => t.toLowerCase()),
      ...content.platforms.map((p) => p.toLowerCase()),
    ]

    searchTerms.forEach((term) => {
      if (!this.searchIndex.has(term)) {
        this.searchIndex.set(term, new Set())
      }
      this.searchIndex.get(term)!.add(content.id)
    })
  }

  /**
   * Search content in library
   */
  searchContent(
    query: string,
    filters?: {
      type?: string
      category?: string
      platform?: string
      tags?: string[]
    },
  ): LibraryContent[] {
    try {
      const queryLower = query.toLowerCase()
      const foundIds = new Set<string>()

      // Search by title, description, and tags
      this.contentItems.forEach((content, id) => {
        const matches =
          content.title.toLowerCase().includes(queryLower) ||
          content.description.toLowerCase().includes(queryLower) ||
          content.tags.some((tag) =>
            tag.toLowerCase().includes(queryLower),
          )

        if (matches) {
          foundIds.add(id)
        }
      })

      // Apply filters
      let results = Array.from(foundIds)
        .map((id) => this.contentItems.get(id)!)

      if (filters?.type) {
        results = results.filter((c) => c.type === filters.type)
      }

      if (filters?.category) {
        results = results.filter((c) => c.category === filters.category)
      }

      if (filters?.platform) {
        results = results.filter((c) =>
          c.platforms.includes(filters.platform!),
        )
      }

      if (filters?.tags && filters.tags.length > 0) {
        results = results.filter((c) =>
          filters.tags!.some((tag) => c.tags.includes(tag)),
        )
      }

      return results.sort((a, b) => b.usage_count - a.usage_count)
    } catch (error: any) {
      this.logger.error(
        `Failed to search content: ${error.message}`,
      )
      return []
    }
  }

  /**
   * Get content by ID
   */
  getContent(contentId: string): LibraryContent | undefined {
    const content = this.contentItems.get(contentId)

    if (content) {
      // Increment usage count
      content.usage_count++
      content.updated_at = new Date()
    }

    return content
  }

  /**
   * Update content metadata
   */
  updateContent(
    contentId: string,
    updates: Partial<LibraryContent>,
  ): LibraryContent | undefined {
    try {
      const content = this.contentItems.get(contentId)

      if (!content) {
        return undefined
      }

      Object.assign(content, updates, {
        updated_at: new Date(),
      })

      this.logger.log(`Updated content: ${content.title}`)

      return content
    } catch (error: any) {
      this.logger.error(
        `Failed to update content: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Delete content from library
   */
  deleteContent(contentId: string): boolean {
    try {
      const deleted = this.contentItems.delete(contentId)

      if (deleted) {
        this.logger.log(`Deleted content: ${contentId}`)
      }

      return deleted
    } catch (error: any) {
      this.logger.error(
        `Failed to delete content: ${error.message}`,
      )
      return false
    }
  }

  /**
   * Create a new folder
   */
  createFolder(folder: Omit<ContentFolder, 'id' | 'created_at' | 'updated_at'>): ContentFolder {
    try {
      const id = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const newFolder: ContentFolder = {
        ...folder,
        id,
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
      }

      this.folders.set(id, newFolder)

      this.logger.log(`Created folder: ${folder.name} (${id})`)

      return newFolder
    } catch (error: any) {
      this.logger.error(
        `Failed to create folder: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Add content to folder
   */
  addToFolder(folderId: string, contentId: string): boolean {
    try {
      const folder = this.folders.get(folderId)

      if (!folder) {
        return false
      }

      if (!folder.items.includes(contentId)) {
        folder.items.push(contentId)
        folder.updated_at = new Date()
        this.logger.log(`Added content to folder: ${folderId}`)
      }

      return true
    } catch (error: any) {
      this.logger.error(
        `Failed to add content to folder: ${error.message}`,
      )
      return false
    }
  }

  /**
   * Get folder contents
   */
  getFolderContents(folderId: string): LibraryContent[] {
    try {
      const folder = this.folders.get(folderId)

      if (!folder) {
        return []
      }

      return folder.items
        .map((id) => this.contentItems.get(id))
        .filter((item) => item !== undefined) as LibraryContent[]
    } catch (error: any) {
      this.logger.error(
        `Failed to get folder contents: ${error.message}`,
      )
      return []
    }
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): ContentTemplate | undefined {
    return this.templates.get(templateId)
  }

  /**
   * Get templates for platform
   */
  getTemplatesByPlatform(platform: string): ContentTemplate[] {
    return Array.from(this.templates.values()).filter(
      (t) => t.platform === platform,
    )
  }

  /**
   * Get all templates
   */
  getAllTemplates(): ContentTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Get library statistics
   */
  getStatistics(): {
    total_items: number
    by_type: Record<string, number>
    by_category: Record<string, number>
    by_platform: Record<string, number>
    total_size_mb: number
    most_used_items: LibraryContent[]
  } {
    try {
      const byType: Record<string, number> = {}
      const byCategory: Record<string, number> = {}
      const byPlatform: Record<string, number> = {}
      let totalSize = 0

      const items = Array.from(this.contentItems.values())

      items.forEach((content) => {
        // Count by type
        byType[content.type] = (byType[content.type] || 0) + 1

        // Count by category
        byCategory[content.category] = (byCategory[content.category] || 0) + 1

        // Count by platform
        content.platforms.forEach((platform) => {
          byPlatform[platform] = (byPlatform[platform] || 0) + 1
        })

        // Calculate total size
        if (content.file_size) {
          totalSize += content.file_size
        }
      })

      // Get most used items
      const mostUsed = items.sort((a, b) => b.usage_count - a.usage_count).slice(0, 5)

      return {
        total_items: items.length,
        by_type: byType,
        by_category: byCategory,
        by_platform: byPlatform,
        total_size_mb: Math.round((totalSize / 1024 / 1024) * 100) / 100,
        most_used_items: mostUsed,
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to get statistics: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Get recommendations based on usage patterns
   */
  getContentRecommendations(
    platform: string,
  ): {
    recommended_templates: ContentTemplate[]
    popular_content: LibraryContent[]
    suggested_categories: string[]
  } {
    try {
      const templates = this.getTemplatesByPlatform(platform)
      const allItems = Array.from(this.contentItems.values())
      const platformContent = allItems.filter((c) =>
        c.platforms.includes(platform),
      )

      const popularContent = platformContent
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 10)

      const categories = new Set(
        platformContent.map((c) => c.category),
      )

      return {
        recommended_templates: templates.slice(0, 3),
        popular_content: popularContent,
        suggested_categories: Array.from(categories),
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to get recommendations: ${error.message}`,
      )
      throw error
    }
  }
}
