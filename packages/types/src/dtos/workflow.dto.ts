/**
 * WORKFLOW DTOs
 *
 * @description Data Transfer Objects for workflow orchestration
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#workflow-orchestration
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#workflow-apis
 * @useCase UC080-UC089 (Workflow Automation)
 */

import type {
  WorkflowStatus,
  WorkflowTrigger,
  ActionType,
  WorkflowAction,
  WorkflowCondition,
} from '../marketing/workflow.types';

/**
 * Create Workflow DTO
 * @useCase UC080 - Create Workflow
 */
export class CreateWorkflowDto {
  /** Workflow name */
  name: string;

  /** Description */
  description: string;

  /** Trigger configuration */
  trigger: {
    type: WorkflowTrigger;
    schedule?: string; // Cron expression
    event?: string;
    condition?: WorkflowCondition;
  };

  /** Actions to execute */
  actions: Array<{
    type: ActionType;
    name: string;
    description?: string;
    config: Record<string, unknown>;
    order: number;
    retryOnFailure?: boolean;
    maxRetries?: number;
    continueOnFailure?: boolean;
    condition?: WorkflowCondition;
  }>;

  /** Maximum retries for workflow */
  maxRetries?: number;

  /** Timeout in seconds */
  timeoutSeconds?: number;

  /** Whether enabled */
  enabled?: boolean;
}

/**
 * Update Workflow DTO
 * @useCase UC081 - Update Workflow
 */
export class UpdateWorkflowDto {
  name?: string;
  description?: string;
  status?: WorkflowStatus;
  trigger?: {
    type: WorkflowTrigger;
    schedule?: string;
    event?: string;
    condition?: WorkflowCondition;
  };
  actions?: Array<{
    type: ActionType;
    name: string;
    description?: string;
    config: Record<string, unknown>;
    order: number;
    retryOnFailure?: boolean;
    maxRetries?: number;
    continueOnFailure?: boolean;
    condition?: WorkflowCondition;
  }>;
  maxRetries?: number;
  timeoutSeconds?: number;
  enabled?: boolean;
}

/**
 * Execute Workflow DTO
 * @useCase UC082 - Execute Workflow Manually
 */
export class ExecuteWorkflowDto {
  /** Workflow ID */
  workflowId: string;

  /** Input data */
  data?: Record<string, unknown>;

  /** Whether to force execution even if disabled */
  forceExecution?: boolean;
}

/**
 * Pause Workflow DTO
 * @useCase UC083 - Pause Workflow
 */
export class PauseWorkflowDto {
  /** Workflow ID */
  workflowId: string;

  /** Reason for pausing */
  reason?: string;
}

/**
 * Resume Workflow DTO
 * @useCase UC084 - Resume Workflow
 */
export class ResumeWorkflowDto {
  /** Workflow ID */
  workflowId: string;
}

/**
 * Cancel Workflow Execution DTO
 * @useCase UC085 - Cancel Workflow Execution
 */
export class CancelWorkflowExecutionDto {
  /** Execution ID */
  executionId: string;

  /** Reason for cancellation */
  reason?: string;
}

/**
 * Retry Workflow Execution DTO
 * @useCase UC086 - Retry Failed Workflow
 */
export class RetryWorkflowExecutionDto {
  /** Execution ID */
  executionId: string;

  /** Whether to retry from failed action */
  fromFailedAction?: boolean;
}

/**
 * Create Workflow from Template DTO
 * @useCase UC087 - Create from Template
 */
export class CreateFromTemplateDto {
  /** Template ID */
  templateId: string;

  /** Workflow name */
  name: string;

  /** Customizations */
  customizations?: {
    trigger?: Partial<CreateWorkflowDto['trigger']>;
    actions?: Partial<WorkflowAction>[];
  };
}

/**
 * Workflow Query Parameters
 */
export class WorkflowQueryDto {
  status?: WorkflowStatus;
  enabled?: boolean;
  triggerType?: WorkflowTrigger;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'lastExecutedAt' | 'totalExecutions';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get Workflow Analytics DTO
 */
export class GetWorkflowAnalyticsDto {
  /** Workflow ID */
  workflowId: string;

  /** Time range start */
  startDate?: string;

  /** Time range end */
  endDate?: string;

  /** Group by */
  groupBy?: 'day' | 'week' | 'month';
}

/**
 * Get Workflow Executions DTO
 */
export class GetWorkflowExecutionsDto {
  /** Workflow ID */
  workflowId?: string;

  /** Status filter */
  status?: 'running' | 'completed' | 'failed' | 'cancelled';

  /** Date from */
  dateFrom?: string;

  /** Date to */
  dateTo?: string;

  /** Page */
  page?: number;

  /** Limit */
  limit?: number;

  /** Sort by */
  sortBy?: 'startedAt' | 'duration';

  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}
