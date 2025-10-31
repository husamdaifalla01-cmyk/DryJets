import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

/**
 * Semantic Keyword Clustering Service
 * Uses NLP and semantic similarity to group related keywords
 */

export interface KeywordCluster {
  clusterId: string;
  name: string;
  theme: string;
  keywords: Array<{
    keyword: string;
    searchVolume: number;
    similarity: number;
    intent: string;
  }>;
  totalSearchVolume: number;
  avgDifficulty: number;
  primaryIntent: string;
  opportunityScore: number;
}

export interface SemanticSimilarity {
  keyword1: string;
  keyword2: string;
  similarity: number; // 0-1
  relationship: 'SYNONYM' | 'RELATED' | 'PARENT_CHILD' | 'COMPLEMENTARY' | 'UNRELATED';
}

@Injectable()
export class SemanticKeywordClusteringService {
  private readonly logger = new Logger('SemanticKeywordClustering');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Cluster keywords using semantic similarity
   */
  async clusterKeywords(keywordIds: string[]): Promise<KeywordCluster[]> {
    this.logger.log(`Clustering ${keywordIds.length} keywords`);

    // Get keyword data
    const keywords = await this.prisma.keyword.findMany({
      where: {
        id: { in: keywordIds },
      },
    });

    if (keywords.length === 0) {
      return [];
    }

    // Calculate similarity matrix
    const similarityMatrix = await this.calculateSimilarityMatrix(keywords);

    // Perform hierarchical clustering
    const clusters = this.hierarchicalClustering(keywords, similarityMatrix);

    // Analyze and enrich clusters
    const enrichedClusters = await Promise.all(
      clusters.map((cluster) => this.enrichCluster(cluster)),
    );

    // Calculate opportunity scores
    return enrichedClusters.map((cluster) => ({
      ...cluster,
      opportunityScore: this.calculateClusterOpportunity(cluster),
    }));
  }

  /**
   * Calculate semantic similarity between keywords
   */
  async calculateSemanticSimilarity(
    keyword1: string,
    keyword2: string,
  ): Promise<SemanticSimilarity> {
    const prompt = `Analyze the semantic relationship between these keywords:

Keyword 1: "${keyword1}"
Keyword 2: "${keyword2}"

Rate similarity from 0.0 to 1.0:
- 1.0 = Identical or synonyms
- 0.7-0.9 = Highly related
- 0.4-0.6 = Somewhat related
- 0.1-0.3 = Loosely related
- 0.0 = Unrelated

Relationship types:
- SYNONYM: Same meaning (e.g., "car" and "automobile")
- RELATED: Related concepts (e.g., "car" and "vehicle")
- PARENT_CHILD: One is subset of other (e.g., "car" and "sedan")
- COMPLEMENTARY: Often used together (e.g., "car" and "insurance")
- UNRELATED: No meaningful connection

Return JSON:
{
  "similarity": <0.0-1.0>,
  "relationship": "<type>"
}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '{}';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          keyword1,
          keyword2,
          similarity: result.similarity,
          relationship: result.relationship,
        };
      }
    } catch (error) {
      this.logger.error(`Similarity calculation error: ${error.message}`);
    }

    // Fallback: Simple string similarity (Jaccard)
    const similarity = this.jaccardSimilarity(keyword1, keyword2);
    return {
      keyword1,
      keyword2,
      similarity,
      relationship: similarity > 0.5 ? 'RELATED' : 'UNRELATED',
    };
  }

  /**
   * Calculate similarity matrix for all keywords
   */
  private async calculateSimilarityMatrix(
    keywords: any[],
  ): Promise<number[][]> {
    const n = keywords.length;
    const matrix: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    // For large keyword sets, use batch processing
    if (n > 20) {
      return this.calculateSimilarityMatrixBatch(keywords);
    }

    // Calculate pairwise similarities
    for (let i = 0; i < n; i++) {
      matrix[i][i] = 1.0; // Self-similarity

      for (let j = i + 1; j < n; j++) {
        const similarity = await this.calculateSemanticSimilarity(
          keywords[i].keyword,
          keywords[j].keyword,
        );

        matrix[i][j] = similarity.similarity;
        matrix[j][i] = similarity.similarity;
      }
    }

    return matrix;
  }

  /**
   * Batch similarity calculation for large sets
   */
  private async calculateSimilarityMatrixBatch(
    keywords: any[],
  ): Promise<number[][]> {
    this.logger.log('Using batch similarity calculation');

    const n = keywords.length;
    const matrix: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    // Use AI to cluster similar keywords in batches
    const prompt = `Group these ${n} keywords into semantic clusters:

${keywords.map((k, i) => `${i + 1}. ${k.keyword}`).join('\n')}

Return JSON array of clusters:
[
  {
    "clusterName": "...",
    "keywordIndices": [1, 3, 5]
  }
]`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '[]';

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const clusters = JSON.parse(jsonMatch[0]);

        // Set high similarity within clusters
        clusters.forEach((cluster: any) => {
          const indices = cluster.keywordIndices.map((i: number) => i - 1);
          for (let i = 0; i < indices.length; i++) {
            for (let j = i + 1; j < indices.length; j++) {
              const idx1 = indices[i];
              const idx2 = indices[j];
              matrix[idx1][idx2] = 0.8;
              matrix[idx2][idx1] = 0.8;
            }
          }
        });
      }
    } catch (error) {
      this.logger.error(`Batch clustering error: ${error.message}`);
      // Fallback to Jaccard similarity
      return this.jaccardSimilarityMatrix(keywords);
    }

    // Set self-similarity
    for (let i = 0; i < n; i++) {
      matrix[i][i] = 1.0;
    }

    return matrix;
  }

  /**
   * Hierarchical clustering algorithm
   */
  private hierarchicalClustering(
    keywords: any[],
    similarityMatrix: number[][],
    threshold: number = 0.6,
  ): Array<{
    keywords: any[];
    avgSimilarity: number;
  }> {
    const n = keywords.length;
    const clusters: Array<{ keywords: any[]; avgSimilarity: number }> = [];

    // Track which keywords are already clustered
    const clustered = new Set<number>();

    // Find clusters
    for (let i = 0; i < n; i++) {
      if (clustered.has(i)) continue;

      const cluster = [keywords[i]];
      clustered.add(i);

      let totalSimilarity = 0;
      let similarityCount = 0;

      // Find similar keywords
      for (let j = i + 1; j < n; j++) {
        if (clustered.has(j)) continue;

        if (similarityMatrix[i][j] >= threshold) {
          cluster.push(keywords[j]);
          clustered.add(j);
          totalSimilarity += similarityMatrix[i][j];
          similarityCount++;
        }
      }

      const avgSimilarity =
        similarityCount > 0 ? totalSimilarity / similarityCount : 1.0;

      clusters.push({
        keywords: cluster,
        avgSimilarity,
      });
    }

    return clusters;
  }

  /**
   * Enrich cluster with metadata and analysis
   */
  private async enrichCluster(cluster: any): Promise<KeywordCluster> {
    const keywords = cluster.keywords;

    // Determine cluster theme using AI
    const theme = await this.determineClusterTheme(keywords);

    // Calculate aggregate metrics
    const totalSearchVolume = keywords.reduce(
      (sum: number, k: any) => sum + k.searchVolume,
      0,
    );
    const avgDifficulty =
      keywords.reduce((sum: number, k: any) => sum + k.difficulty, 0) /
      keywords.length;

    // Determine primary intent
    const intentCounts: Record<string, number> = {};
    keywords.forEach((k: any) => {
      intentCounts[k.intent] = (intentCounts[k.intent] || 0) + 1;
    });
    const primaryIntent = Object.keys(intentCounts).reduce((a, b) =>
      intentCounts[a] > intentCounts[b] ? a : b,
    );

    return {
      clusterId: `cluster-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: theme.name,
      theme: theme.description,
      keywords: keywords.map((k: any) => ({
        keyword: k.keyword,
        searchVolume: k.searchVolume,
        similarity: cluster.avgSimilarity,
        intent: k.intent,
      })),
      totalSearchVolume,
      avgDifficulty,
      primaryIntent,
      opportunityScore: 0, // Will be calculated later
    };
  }

  /**
   * Determine cluster theme using AI
   */
  private async determineClusterTheme(keywords: any[]): Promise<{
    name: string;
    description: string;
  }> {
    const keywordList = keywords.map((k: any) => k.keyword).join(', ');

    const prompt = `Analyze these related keywords and determine the unifying theme:

Keywords: ${keywordList}

Return JSON:
{
  "name": "Short cluster name (2-4 words)",
  "description": "Brief description of the theme"
}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '{}';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Theme determination error: ${error.message}`);
    }

    // Fallback: Use most common word
    const words = keywords.flatMap((k: any) => k.keyword.toLowerCase().split(/\s+/));
    const wordCounts: Record<string, number> = {};
    words.forEach((w: string) => {
      if (w.length > 3) {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
      }
    });

    const commonWord = Object.keys(wordCounts).reduce((a, b) =>
      wordCounts[a] > wordCounts[b] ? a : b,
    );

    return {
      name: `${commonWord} cluster`,
      description: `Keywords related to ${commonWord}`,
    };
  }

  /**
   * Calculate cluster opportunity score
   */
  private calculateClusterOpportunity(cluster: KeywordCluster): number {
    let score = 50;

    // Search volume impact (max 30 points)
    if (cluster.totalSearchVolume > 100000) score += 30;
    else if (cluster.totalSearchVolume > 50000) score += 20;
    else if (cluster.totalSearchVolume > 10000) score += 10;

    // Difficulty (lower is better, max 20 points)
    if (cluster.avgDifficulty < 30) score += 20;
    else if (cluster.avgDifficulty < 50) score += 10;
    else if (cluster.avgDifficulty > 70) score -= 10;

    // Cluster size (max 15 points)
    const keywordCount = cluster.keywords.length;
    if (keywordCount >= 10) score += 15;
    else if (keywordCount >= 5) score += 10;
    else if (keywordCount >= 3) score += 5;

    // Intent alignment (max 15 points)
    if (cluster.primaryIntent === 'TRANSACTIONAL') score += 15;
    else if (cluster.primaryIntent === 'COMMERCIAL') score += 10;
    else if (cluster.primaryIntent === 'INFORMATIONAL') score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Jaccard similarity (fallback for simple text comparison)
   */
  private jaccardSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.toLowerCase().split(/\s+/));
    const set2 = new Set(str2.toLowerCase().split(/\s+/));

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Calculate Jaccard similarity matrix
   */
  private jaccardSimilarityMatrix(keywords: any[]): number[][] {
    const n = keywords.length;
    const matrix: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      matrix[i][i] = 1.0;

      for (let j = i + 1; j < n; j++) {
        const similarity = this.jaccardSimilarity(
          keywords[i].keyword,
          keywords[j].keyword,
        );
        matrix[i][j] = similarity;
        matrix[j][i] = similarity;
      }
    }

    return matrix;
  }

  /**
   * Suggest content pillar strategy from clusters
   */
  async suggestContentPillars(
    clusters: KeywordCluster[],
  ): Promise<
    Array<{
      pillarTopic: string;
      pillarKeyword: string;
      supportingClusters: string[];
      estimatedTraffic: number;
      contentPieces: number;
    }>
  > {
    // Sort clusters by opportunity
    const topClusters = clusters
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 10);

    const pillars = topClusters.map((cluster) => ({
      pillarTopic: cluster.name,
      pillarKeyword: cluster.keywords[0].keyword,
      supportingClusters: cluster.keywords.slice(1, 6).map((k) => k.keyword),
      estimatedTraffic: Math.floor(cluster.totalSearchVolume * 0.15), // 15% CTR assumption
      contentPieces: cluster.keywords.length + 1, // 1 pillar + supporting content
    }));

    return pillars;
  }
}
