/**
 * BASE DTO CLASSES
 *
 * @description Base classes and utilities for Data Transfer Objects
 * @references ARCHITECTURAL_GOVERNANCE.md
 */

/**
 * Base pagination query parameters
 */
export class PaginationDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Base filter query parameters
 */
export class FilterDto {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Base time range parameters
 */
export class TimeRangeDto {
  startDate: string;
  endDate: string;
  timezone?: string;
}

/**
 * Base response wrapper
 */
export class ResponseDto<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Paginated response wrapper
 */
export class PaginatedResponseDto<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
