import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

interface SchemaOptions {
  type: 'article' | 'faq' | 'howto' | 'product' | 'local_business' | 'breadcrumb' | 'review';
  data: any;
}

@Injectable()
export class SchemaAutomationService {
  private readonly logger = new Logger('SchemaAutomation');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate Article schema
   */
  generateArticleSchema(data: {
    headline: string;
    description: string;
    author?: string;
    datePublished?: Date;
    dateModified?: Date;
    imageUrl?: string;
  }): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.headline,
      description: data.description,
      author: {
        '@type': 'Person',
        name: data.author || 'DryJets Team',
      },
      datePublished: (data.datePublished || new Date()).toISOString(),
      dateModified: (data.dateModified || new Date()).toISOString(),
      image: data.imageUrl || 'https://example.com/default-image.jpg',
      publisher: {
        '@type': 'Organization',
        name: 'DryJets',
        logo: {
          '@type': 'ImageObject',
          url: 'https://example.com/logo.png',
        },
      },
    };
  }

  /**
   * Generate FAQ schema
   */
  generateFAQSchema(questions: Array<{ question: string; answer: string }>): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer,
        },
      })),
    };
  }

  /**
   * Generate HowTo schema
   */
  generateHowToSchema(data: {
    name: string;
    description: string;
    totalTime?: string;
    steps: Array<{ name: string; text: string; image?: string }>;
  }): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: data.name,
      description: data.description,
      totalTime: data.totalTime || 'PT30M',
      step: data.steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
        image: step.image,
      })),
    };
  }

  /**
   * Generate Product schema
   */
  generateProductSchema(data: {
    name: string;
    description: string;
    image: string;
    brand?: string;
    offers?: {
      price: number;
      currency: string;
      availability?: string;
    };
    aggregateRating?: {
      ratingValue: number;
      reviewCount: number;
    };
  }): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.name,
      description: data.description,
      image: data.image,
      brand: {
        '@type': 'Brand',
        name: data.brand || 'DryJets',
      },
    };

    if (data.offers) {
      schema.offers = {
        '@type': 'Offer',
        price: data.offers.price,
        priceCurrency: data.offers.currency || 'USD',
        availability: data.offers.availability || 'https://schema.org/InStock',
      };
    }

    if (data.aggregateRating) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: data.aggregateRating.ratingValue,
        reviewCount: data.aggregateRating.reviewCount,
      };
    }

    return schema;
  }

  /**
   * Generate LocalBusiness schema
   */
  generateLocalBusinessSchema(data: {
    name: string;
    description: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    phone?: string;
    url?: string;
    geo?: {
      latitude: number;
      longitude: number;
    };
    openingHours?: string[];
  }): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: data.name,
      description: data.description,
      address: {
        '@type': 'PostalAddress',
        streetAddress: data.address.streetAddress,
        addressLocality: data.address.addressLocality,
        addressRegion: data.address.addressRegion,
        postalCode: data.address.postalCode,
        addressCountry: data.address.addressCountry,
      },
    };

    if (data.phone) {
      schema.telephone = data.phone;
    }

    if (data.url) {
      schema.url = data.url;
    }

    if (data.geo) {
      schema.geo = {
        '@type': 'GeoCoordinates',
        latitude: data.geo.latitude,
        longitude: data.geo.longitude,
      };
    }

    if (data.openingHours) {
      schema.openingHoursSpecification = data.openingHours.map(hours => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: hours.split(' ')[0],
        opens: hours.split(' ')[1],
        closes: hours.split(' ')[2],
      }));
    }

    return schema;
  }

  /**
   * Generate Breadcrumb schema
   */
  generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  /**
   * Generate Review schema
   */
  generateReviewSchema(data: {
    itemReviewed: {
      type: string;
      name: string;
    };
    author: string;
    reviewRating: {
      ratingValue: number;
      bestRating?: number;
    };
    reviewBody: string;
  }): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Review',
      itemReviewed: {
        '@type': data.itemReviewed.type,
        name: data.itemReviewed.name,
      },
      author: {
        '@type': 'Person',
        name: data.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: data.reviewRating.ratingValue,
        bestRating: data.reviewRating.bestRating || 5,
      },
      reviewBody: data.reviewBody,
    };
  }

  /**
   * Auto-generate schema for page based on content
   */
  async autoGenerateSchema(pageId: string): Promise<any> {
    const page = await this.prisma.programmaticPage.findUnique({
      where: { id: pageId },
      include: { targetKeyword: true },
    });

    if (!page) {
      throw new Error('Page not found');
    }

    // Determine schema type based on page type and keyword
    const schemas: any[] = [];

    // Always add Article schema
    schemas.push(this.generateArticleSchema({
      headline: page.title,
      description: page.metaDescription || '',
      datePublished: page.createdAt,
      dateModified: page.updatedAt,
    }));

    // Add type-specific schema
    switch (page.pageType) {
      case 'QUESTION_PAGE':
        // Extract Q&A from content
        const questions = this.extractQuestionsFromContent(page.content);
        if (questions.length > 0) {
          schemas.push(this.generateFAQSchema(questions));
        }
        break;

      case 'ULTIMATE_GUIDE':
        // Extract steps if it's a how-to guide
        if (page.content.toLowerCase().includes('step')) {
          const steps = this.extractStepsFromContent(page.content);
          if (steps.length > 0) {
            schemas.push(this.generateHowToSchema({
              name: page.title,
              description: page.metaDescription || '',
              steps,
            }));
          }
        }
        break;

      case 'LOCATION_PAGE':
        // Add LocalBusiness schema if location data is available
        // This would need actual business data
        break;
    }

    // Always add Breadcrumb schema
    schemas.push(this.generateBreadcrumbSchema([
      { name: 'Home', url: 'https://example.com' },
      { name: page.title, url: `https://example.com/${page.slug}` },
    ]));

    // Combine all schemas
    const combinedSchema = schemas.length === 1 ? schemas[0] : {
      '@context': 'https://schema.org',
      '@graph': schemas,
    };

    // Save schema to page
    await this.prisma.programmaticPage.update({
      where: { id: pageId },
      data: {
        schemaMarkup: combinedSchema,
      },
    });

    this.logger.log(`Generated schema for page: ${page.slug}`);
    return combinedSchema;
  }

  /**
   * Extract questions from content
   */
  private extractQuestionsFromContent(content: string): Array<{ question: string; answer: string }> {
    const questions: Array<{ question: string; answer: string }> = [];

    // Simple extraction - look for H2/H3 headers with questions
    const questionPattern = /<h[23]>(.*?\?)<\/h[23]>/gi;
    const matches = content.matchAll(questionPattern);

    for (const match of matches) {
      questions.push({
        question: match[1].replace(/<[^>]*>/g, ''),
        answer: 'Answer extracted from content.', // Would need better extraction logic
      });
    }

    return questions.slice(0, 10); // Limit to 10 FAQs
  }

  /**
   * Extract steps from content
   */
  private extractStepsFromContent(content: string): Array<{ name: string; text: string }> {
    const steps: Array<{ name: string; text: string }> = [];

    // Simple extraction - look for numbered lists or step headers
    const stepPattern = /<h[23]>.*?step\s+\d+:?\s+(.*?)<\/h[23]>/gi;
    const matches = content.matchAll(stepPattern);

    for (const match of matches) {
      steps.push({
        name: match[1].replace(/<[^>]*>/g, ''),
        text: 'Step description extracted from content.',
      });
    }

    return steps;
  }

  /**
   * Bulk generate schema for all pages
   */
  async bulkGenerateSchema(limit: number = 100): Promise<{
    generated: number;
    failed: number;
  }> {
    this.logger.log(`Bulk generating schema for ${limit} pages...`);

    const pages = await this.prisma.programmaticPage.findMany({
      where: {
        schemaMarkup: null,
      },
      take: limit,
    });

    let generated = 0;
    let failed = 0;

    for (const page of pages) {
      try {
        await this.autoGenerateSchema(page.id);
        generated++;
      } catch (error) {
        this.logger.error(`Failed to generate schema for ${page.slug}: ${error.message}`);
        failed++;
      }
    }

    this.logger.log(`Schema generation complete: ${generated} generated, ${failed} failed`);
    return { generated, failed };
  }

  /**
   * Validate schema
   */
  validateSchema(schema: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Basic validation
    if (!schema['@context']) {
      errors.push('Missing @context');
    }

    if (!schema['@type'] && !schema['@graph']) {
      errors.push('Missing @type or @graph');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get schema stats
   */
  async getSchemaStats(): Promise<{
    totalPages: number;
    pagesWithSchema: number;
    pagesWithoutSchema: number;
    schemaTypes: Record<string, number>;
  }> {
    const totalPages = await this.prisma.programmaticPage.count();
    const pagesWithSchema = await this.prisma.programmaticPage.count({
      where: { schemaMarkup: { not: null } },
    });

    return {
      totalPages,
      pagesWithSchema,
      pagesWithoutSchema: totalPages - pagesWithSchema,
      schemaTypes: {
        Article: pagesWithSchema, // Simplified - would need to parse actual schema
        FAQ: 0,
        HowTo: 0,
        Breadcrumb: pagesWithSchema,
      },
    };
  }
}
