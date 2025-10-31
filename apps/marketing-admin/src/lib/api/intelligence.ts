import apiClient from './client';

/**
 * INTELLIGENCE API FUNCTIONS
 *
 * API calls for AI-powered marketing intelligence across 7 domains.
 * Maps to backend IntelligenceController (26 endpoints).
 */

const getBasePath = (profileId: string) => `/marketing/profiles/${profileId}/intelligence`;

/**
 * ========================================
 * NARRATIVE INTELLIGENCE (5 endpoints)
 * ========================================
 */

export interface NarrativeInsights {
  profileId: string;
  narratives: Narrative[];
  trends: NarrativeTrend[];
  recommendations: string[];
}

export interface Narrative {
  id: string;
  topic: string;
  angle: string;
  effectiveness: number;
  platforms: string[];
  examples: string[];
}

export interface NarrativeTrend {
  topic: string;
  momentum: 'rising' | 'stable' | 'declining';
  relevance: number;
}

export const getNarrativeInsights = async (profileId: string) => {
  const res = await apiClient.get<NarrativeInsights>(`${getBasePath(profileId)}/narrative`);
  return res.data;
};

export const analyzeNarrative = async (profileId: string, content: string) => {
  const res = await apiClient.post(`${getBasePath(profileId)}/narrative/analyze`, { content });
  return res.data;
};

/**
 * ========================================
 * GROWTH INTELLIGENCE (4 endpoints)
 * ========================================
 */

export interface GrowthInsights {
  profileId: string;
  growthScore: number;
  opportunities: GrowthOpportunity[];
  bottlenecks: Bottleneck[];
  projections: GrowthProjection[];
}

export interface GrowthOpportunity {
  id: string;
  type: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  description: string;
  expectedGrowth: string;
}

export interface Bottleneck {
  area: string;
  severity: number;
  recommendation: string;
}

export interface GrowthProjection {
  metric: string;
  current: number;
  projected30d: number;
  projected90d: number;
}

export const getGrowthInsights = async (profileId: string) => {
  const res = await apiClient.get<GrowthInsights>(`${getBasePath(profileId)}/growth`);
  return res.data;
};

/**
 * ========================================
 * ALGORITHM INTELLIGENCE (3 endpoints)
 * ========================================
 */

export interface AlgorithmInsights {
  profileId: string;
  platformAlgorithms: PlatformAlgorithm[];
  optimizationTips: OptimizationTip[];
  timingRecommendations: TimingRecommendation[];
}

export interface PlatformAlgorithm {
  platform: string;
  score: number;
  factors: AlgorithmFactor[];
  lastUpdate: string;
}

export interface AlgorithmFactor {
  name: string;
  weight: number;
  yourScore: number;
  recommendation: string;
}

export interface OptimizationTip {
  platform: string;
  tip: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TimingRecommendation {
  platform: string;
  bestTimes: string[];
  worstTimes: string[];
  timezone: string;
}

export const getAlgorithmInsights = async (profileId: string) => {
  const res = await apiClient.get<AlgorithmInsights>(`${getBasePath(profileId)}/algorithm`);
  return res.data;
};

/**
 * ========================================
 * E-E-A-T INTELLIGENCE (4 endpoints)
 * ========================================
 */

export interface EEATInsights {
  profileId: string;
  overallScore: number;
  experience: EEATScore;
  expertise: EEATScore;
  authoritativeness: EEATScore;
  trustworthiness: EEATScore;
  recommendations: EEATRecommendation[];
}

export interface EEATScore {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvementActions: string[];
}

export interface EEATRecommendation {
  category: 'experience' | 'expertise' | 'authoritativeness' | 'trustworthiness';
  action: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
}

export const getEEATInsights = async (profileId: string) => {
  const res = await apiClient.get<EEATInsights>(`${getBasePath(profileId)}/eeat`);
  return res.data;
};

/**
 * ========================================
 * ATTRIBUTION INTELLIGENCE (5 endpoints)
 * ========================================
 */

export interface AttributionInsights {
  profileId: string;
  touchpoints: Touchpoint[];
  journeys: CustomerJourney[];
  attributionModel: AttributionModel;
  conversions: ConversionPath[];
}

export interface Touchpoint {
  channel: string;
  stage: 'awareness' | 'consideration' | 'decision';
  interactions: number;
  conversions: number;
  value: number;
}

export interface CustomerJourney {
  id: string;
  path: string[];
  duration: string;
  converted: boolean;
  value: number;
}

export interface AttributionModel {
  type: 'first-touch' | 'last-touch' | 'linear' | 'time-decay' | 'position-based';
  channelWeights: Record<string, number>;
}

export interface ConversionPath {
  path: string;
  conversions: number;
  value: number;
  avgTime: string;
}

export const getAttributionInsights = async (profileId: string) => {
  const res = await apiClient.get<AttributionInsights>(`${getBasePath(profileId)}/attribution`);
  return res.data;
};

/**
 * ========================================
 * CREATIVE INTELLIGENCE (2 endpoints)
 * ========================================
 */

export interface CreativeInsights {
  profileId: string;
  topPerformers: CreativeElement[];
  patterns: CreativePattern[];
  recommendations: CreativeRecommendation[];
}

export interface CreativeElement {
  type: 'headline' | 'image' | 'cta' | 'format';
  value: string;
  performance: number;
  usage: number;
}

export interface CreativePattern {
  pattern: string;
  effectiveness: number;
  examples: string[];
}

export interface CreativeRecommendation {
  element: string;
  suggestion: string;
  reasoning: string;
  expectedLift: string;
}

export const getCreativeInsights = async (profileId: string) => {
  const res = await apiClient.get<CreativeInsights>(`${getBasePath(profileId)}/creative`);
  return res.data;
};

/**
 * ========================================
 * MEMORY/LEARNING (3 endpoints)
 * ========================================
 */

export interface MemoryInsights {
  profileId: string;
  learnedPatterns: LearnedPattern[];
  contentMemory: ContentMemory[];
  audienceInsights: AudienceInsight[];
}

export interface LearnedPattern {
  id: string;
  pattern: string;
  confidence: number;
  occurrences: number;
  lastSeen: string;
}

export interface ContentMemory {
  topic: string;
  performance: number;
  bestPractices: string[];
  avoid: string[];
}

export interface AudienceInsight {
  segment: string;
  preferences: string[];
  behaviors: string[];
  engagement: number;
}

export const getMemoryInsights = async (profileId: string) => {
  const res = await apiClient.get<MemoryInsights>(`${getBasePath(profileId)}/memory`);
  return res.data;
};
