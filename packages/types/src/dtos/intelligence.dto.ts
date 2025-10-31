/**
 * INTELLIGENCE DTOs
 *
 * @description Data Transfer Objects for AI/ML intelligence operations
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#intelligence-generation
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#intelligence-apis
 * @useCase UC100-UC109 (Intelligence & ML)
 */

/**
 * Generate Landscape Analysis DTO
 * @useCase UC100 - Generate Landscape Analysis
 */
export class GenerateLandscapeAnalysisDto {
  /** Profile ID */
  profileId: string;

  /** Industry focus */
  industry?: string;

  /** Competitor URLs */
  competitorUrls?: string[];

  /** Geographic focus */
  geographicFocus?: string;

  /** Analysis depth */
  depth?: 'quick' | 'standard' | 'comprehensive';

  /** Include SWOT */
  includeSwot?: boolean;

  /** Include content gaps */
  includeContentGaps?: boolean;

  /** Include platform opportunities */
  includePlatformOpportunities?: boolean;
}

/**
 * Generate Marketing Strategy DTO
 * @useCase UC101 - Generate Marketing Strategy
 */
export class GenerateStrategyDto {
  /** Profile ID */
  profileId: string;

  /** Landscape analysis ID to base on */
  landscapeAnalysisId?: string;

  /** Budget constraints */
  budget?: number;

  /** Time horizon (months) */
  timeHorizon?: number;

  /** Primary goals */
  primaryGoals?: string[];

  /** Platforms to focus on */
  platforms?: string[];

  /** Include campaign roadmap */
  includeCampaignRoadmap?: boolean;

  /** Include content strategy */
  includeContentStrategy?: boolean;

  /** Include budget allocation */
  includeBudgetAllocation?: boolean;
}

/**
 * Get AI Insights DTO
 * @useCase UC102 - Get AI Insights
 */
export class GetAiInsightsDto {
  /** Profile ID */
  profileId: string;

  /** Insight types */
  types?: Array<
    | 'performance'
    | 'optimization'
    | 'trends'
    | 'content'
    | 'audience'
    | 'campaign'
    | 'competitive'
  >;

  /** Time range */
  startDate?: string;
  endDate?: string;

  /** Priority filter */
  priority?: 'critical' | 'high' | 'medium' | 'low';

  /** Limit */
  limit?: number;
}

/**
 * Train ML Model DTO
 * @useCase UC103 - Train ML Model
 */
export class TrainMlModelDto {
  /** Profile ID */
  profileId: string;

  /** Model type */
  modelType:
    | 'content_performance'
    | 'trend_prediction'
    | 'audience_segmentation'
    | 'optimal_timing'
    | 'budget_optimization'
    | 'churn_prediction';

  /** Training data date range */
  trainingDataFrom?: string;
  trainingDataTo?: string;

  /** Validation split */
  validationSplit?: number;

  /** Hyperparameters */
  hyperparameters?: Record<string, unknown>;
}

/**
 * Run ML Prediction DTO
 * @useCase UC104 - Run ML Prediction
 */
export class RunPredictionDto {
  /** Model ID */
  modelId: string;

  /** Input data */
  input: Record<string, unknown>;

  /** Return probability scores */
  returnProbabilities?: boolean;

  /** Return feature importance */
  returnFeatureImportance?: boolean;
}

/**
 * Run Experiment DTO
 * @useCase UC105 - Run A/B Experiment
 */
export class RunExperimentDto {
  /** Profile ID */
  profileId: string;

  /** Experiment name */
  name: string;

  /** Experiment type */
  type: 'content' | 'timing' | 'platform' | 'audience' | 'budget';

  /** Variants */
  variants: Array<{
    name: string;
    description: string;
    config: Record<string, unknown>;
    traffic: number; // percentage
  }>;

  /** Target metric */
  targetMetric: string;

  /** Minimum sample size */
  minSampleSize?: number;

  /** Duration (days) */
  duration?: number;

  /** Confidence level */
  confidenceLevel?: number;
}

/**
 * Optimize Campaign DTO
 * @useCase UC106 - Optimize Campaign with AI
 */
export class OptimizeCampaignDto {
  /** Campaign ID */
  campaignId: string;

  /** Optimization goals */
  goals: Array<'maximize_reach' | 'maximize_engagement' | 'maximize_conversions' | 'minimize_cost'>;

  /** Constraints */
  constraints?: {
    maxBudget?: number;
    minQualityScore?: number;
    platforms?: string[];
  };

  /** Auto-apply optimizations */
  autoApply?: boolean;
}

/**
 * Generate Content Recommendations DTO
 * @useCase UC107 - Get Content Recommendations
 */
export class GetContentRecommendationsDto {
  /** Profile ID */
  profileId: string;

  /** Content type */
  contentType?: string;

  /** Platform */
  platform?: string;

  /** Based on */
  basedOn?: 'performance' | 'trends' | 'gaps' | 'audience' | 'all';

  /** Limit */
  limit?: number;
}

/**
 * Analyze Competitor DTO
 * @useCase UC108 - Analyze Competitor
 */
export class AnalyzeCompetitorDto {
  /** Profile ID */
  profileId: string;

  /** Competitor URL or handle */
  competitor: string;

  /** Platforms to analyze */
  platforms?: string[];

  /** Analysis depth */
  depth?: 'quick' | 'standard' | 'comprehensive';

  /** Include content analysis */
  includeContent?: boolean;

  /** Include audience analysis */
  includeAudience?: boolean;

  /** Include performance metrics */
  includePerformance?: boolean;
}

/**
 * Get Optimization Suggestions DTO
 * @useCase UC109 - Get Optimization Suggestions
 */
export class GetOptimizationSuggestionsDto {
  /** Profile ID */
  profileId: string;

  /** Scope */
  scope?: 'campaign' | 'content' | 'seo' | 'budget' | 'timing' | 'all';

  /** Campaign ID filter */
  campaignId?: string;

  /** Priority filter */
  priority?: 'critical' | 'high' | 'medium' | 'low';

  /** Limit */
  limit?: number;

  /** Sort by */
  sortBy?: 'impact' | 'effort' | 'priority';
}

/**
 * Calculate ROI Prediction DTO
 */
export class PredictRoiDto {
  /** Profile ID */
  profileId: string;

  /** Campaign ID or configuration */
  campaignId?: string;
  campaignConfig?: {
    budget: number;
    platforms: string[];
    duration: number;
    targetAudience: string;
  };

  /** Confidence interval */
  confidenceInterval?: number;
}
