/**
 * WORKFLOW TYPES
 *
 * @description Type definitions for automated workflows and orchestration
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#workflow-orchestration
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#workflow-apis
 */

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'completed' | 'failed';
export type WorkflowTrigger = 'manual' | 'schedule' | 'event' | 'condition';
export type ActionType =
  | 'generate_content'
  | 'publish_content'
  | 'analyze_trends'
  | 'optimize_seo'
  | 'send_notification'
  | 'update_profile'
  | 'run_ml_model'
  | 'delay'
  | 'conditional';

export interface Workflow {
  id: string;
  profileId: string;
  name: string;
  description: string;
  status: WorkflowStatus;

  // Trigger configuration
  trigger: {
    type: WorkflowTrigger;
    schedule?: string; // Cron expression
    event?: string; // Event name
    condition?: WorkflowCondition;
  };

  // Actions
  actions: WorkflowAction[];

  // Execution stats
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  lastExecutedAt?: string;
  nextExecutionAt?: string;

  // Configuration
  enabled: boolean;
  maxRetries: number;
  timeoutSeconds: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface WorkflowAction {
  id: string;
  type: ActionType;
  name: string;
  description?: string;

  // Configuration specific to action type
  config: Record<string, unknown>;

  // Execution
  order: number;
  retryOnFailure: boolean;
  maxRetries: number;
  continueOnFailure: boolean;

  // Conditional execution
  condition?: WorkflowCondition;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value: unknown;
  logicalOperator?: 'and' | 'or';
  conditions?: WorkflowCondition[]; // Nested conditions
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';

  // Timing
  startedAt: string;
  completedAt?: string;
  duration?: number; // milliseconds

  // Actions executed
  actionsExecuted: ActionExecution[];

  // Results
  error?: string;
  output?: Record<string, unknown>;

  // Context
  triggeredBy: string;
  triggerData?: Record<string, unknown>;
}

export interface ActionExecution {
  actionId: string;
  actionName: string;
  actionType: ActionType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

  // Timing
  startedAt: string;
  completedAt?: string;
  duration?: number;

  // Results
  error?: string;
  output?: Record<string, unknown>;
  retryCount: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;

  // Pre-configured workflow
  trigger: Workflow['trigger'];
  actions: WorkflowAction[];

  // Metadata
  usageCount: number;
  rating: number;
  tags: string[];
}

export interface WorkflowAnalytics {
  workflowId: string;
  timeRange: {
    start: string;
    end: string;
  };

  // Execution stats
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
  failureReasons: Record<string, number>;

  // Performance by action
  actionPerformance: {
    actionType: ActionType;
    avgDuration: number;
    successRate: number;
    totalExecutions: number;
  }[];

  // Time series data
  executionsByDay: Record<string, number>;
  successRateByDay: Record<string, number>;
}
