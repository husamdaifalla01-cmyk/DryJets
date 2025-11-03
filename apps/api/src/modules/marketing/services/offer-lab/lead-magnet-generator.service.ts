import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

export interface LeadMagnetOptions {
  title: string;
  description?: string;
  format: 'pdf' | 'html' | 'checklist';
  content?: string;
  offerId?: string; // FIX: Added missing offerId field used in controller
  offerTitle?: string;
  offerCategory?: string[];
}

/**
 * Lead magnet generator service
 * Generates PDFs, checklists, and HTML guides
 */
@Injectable()
export class LeadMagnetGeneratorService {
  private readonly logger = new Logger(LeadMagnetGeneratorService.name);
  private readonly storageDir = path.join(process.cwd(), 'storage', 'offer-lab', 'lead-magnets');

  constructor(private readonly http: HttpService) {
    // Ensure storage directory exists
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Generate lead magnet
   */
  async generateLeadMagnet(options: LeadMagnetOptions): Promise<{
    fileUrl: string;
    fileSize: number;
  }> {
    try {
      this.logger.log(`Generating ${options.format} lead magnet: ${options.title}`);

      // Generate content if not provided
      const content = options.content || (await this.generateContent(options));

      // Generate based on format
      switch (options.format) {
        case 'pdf':
          return await this.generatePDF(options.title, content);
        case 'html':
          return await this.generateHTML(options.title, content);
        case 'checklist':
          return await this.generateChecklist(options.title, content);
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }
    } catch (error) {
      this.logger.error(`Lead magnet generation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate content using Claude
   */
  private async generateContent(options: LeadMagnetOptions): Promise<string> {
    const prompt = `Create a valuable ${options.format} lead magnet.

Title: ${options.title}
${options.description ? `Description: ${options.description}` : ''}
${options.offerTitle ? `Related to offer: ${options.offerTitle}` : ''}
${options.offerCategory ? `Category: ${options.offerCategory.join(', ')}` : ''}

Requirements:
- Provide actionable, high-value content
- Make it genuinely useful (not just fluff)
- If checklist: provide 10-15 specific, actionable items
- If guide: provide step-by-step instructions with clear sections
- Use professional but accessible language
- Include practical tips and best practices

${options.format === 'checklist' ? 'Format as a numbered checklist with brief explanations.' : 'Format with clear headings and organized sections.'}

Return clean HTML markup (use <h2>, <h3>, <p>, <ul>, <ol> tags).`;

    try {
      const response = await firstValueFrom(
        this.http.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2500,
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
      content = content.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

      return content;
    } catch (error) {
      this.logger.error(`Claude API error: ${error.message}`);
      return this.getFallbackContent(options);
    }
  }

  /**
   * Generate PDF using Puppeteer
   */
  private async generatePDF(
    title: string,
    content: string,
  ): Promise<{ fileUrl: string; fileSize: number }> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      // Build full HTML document
      const html = this.buildPDFTemplate(title, content);

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const filename = `lead-magnet_${Date.now()}.pdf`;
      const filepath = path.join(this.storageDir, filename);

      await page.pdf({
        path: filepath,
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: true,
      });

      await browser.close();

      // Get file size
      const stats = fs.statSync(filepath);

      return {
        fileUrl: `/storage/offer-lab/lead-magnets/${filename}`,
        fileSize: stats.size,
      };
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  /**
   * Build PDF HTML template
   */
  private buildPDFTemplate(title: string, content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2563eb;
      font-size: 32px;
      margin-bottom: 10px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      font-size: 24px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    h3 {
      color: #1e3a8a;
      font-size: 18px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    p {
      margin-bottom: 15px;
    }
    ul, ol {
      margin-bottom: 20px;
      padding-left: 30px;
    }
    li {
      margin-bottom: 10px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
  <div class="footer">
    <p>© ${new Date().getFullYear()} All Rights Reserved</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate HTML file
   */
  private async generateHTML(
    title: string,
    content: string,
  ): Promise<{ fileUrl: string; fileSize: number }> {
    const html = this.buildPDFTemplate(title, content); // Reuse PDF template

    const filename = `lead-magnet_${Date.now()}.html`;
    const filepath = path.join(this.storageDir, filename);

    fs.writeFileSync(filepath, html);

    const stats = fs.statSync(filepath);

    return {
      fileUrl: `/storage/offer-lab/lead-magnets/${filename}`,
      fileSize: stats.size,
    };
  }

  /**
   * Generate checklist (as PDF)
   */
  private async generateChecklist(
    title: string,
    content: string,
  ): Promise<{ fileUrl: string; fileSize: number }> {
    // Enhance content with checkbox styling
    const enhancedContent = content.replace(
      /<li>/g,
      '<li style="list-style: none; position: relative; padding-left: 30px;"><span style="position: absolute; left: 0;">☐</span> ',
    );

    return await this.generatePDF(title, enhancedContent);
  }

  /**
   * Fallback content if AI fails
   */
  private getFallbackContent(options: LeadMagnetOptions): string {
    if (options.format === 'checklist') {
      return `
<h2>Getting Started</h2>
<ol>
  <li>Review the offer details carefully</li>
  <li>Understand the target audience</li>
  <li>Set clear goals and objectives</li>
  <li>Prepare your marketing materials</li>
  <li>Test your tracking links</li>
  <li>Launch your campaign</li>
  <li>Monitor performance daily</li>
  <li>Optimize based on data</li>
  <li>Scale what works</li>
  <li>Document your learnings</li>
</ol>
      `.trim();
    } else {
      return `
<h2>Introduction</h2>
<p>Welcome to ${options.title}. This guide will help you get the most out of this opportunity.</p>

<h2>Key Benefits</h2>
<ul>
  <li>Comprehensive step-by-step instructions</li>
  <li>Proven strategies and best practices</li>
  <li>Real-world examples and case studies</li>
</ul>

<h2>Getting Started</h2>
<p>Follow these steps to begin your journey to success.</p>
      `.trim();
    }
  }

  /**
   * Clean up old lead magnets
   */
  async cleanupOldLeadMagnets(daysOld: number = 90) {
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

      this.logger.log(`Cleaned up ${deletedCount} old lead magnets`);
      return { deletedCount };
    } catch (error) {
      this.logger.error(`Cleanup error: ${error.message}`);
      throw error;
    }
  }
}
