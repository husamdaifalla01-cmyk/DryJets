/**
 * VALIDATION UTILITIES
 *
 * Helper functions for validating AI-generated outputs
 * against TRUTH_MAP.yaml
 */

import { getTruthMapLoader, TruthMapLoader } from './truth-loader';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'model' | 'field' | 'enum' | 'endpoint' | 'service' | 'platform' | 'external_api';
  message: string;
  line?: number;
  context?: string;
}

export interface ValidationWarning {
  type: string;
  message: string;
  line?: number;
  context?: string;
}

/**
 * Validate database model reference
 */
export function validateModel(
  modelName: string,
  line?: number,
  context?: string
): ValidationResult {
  const loader = getTruthMapLoader();
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!loader.modelExists(modelName)) {
    errors.push({
      type: 'model',
      message: `Model '${modelName}' does not exist in schema.prisma`,
      line,
      context,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate model field reference
 */
export function validateModelField(
  modelName: string,
  fieldName: string,
  line?: number,
  context?: string
): ValidationResult {
  const loader = getTruthMapLoader();
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // First check if model exists
  if (!loader.modelExists(modelName)) {
    errors.push({
      type: 'model',
      message: `Model '${modelName}' does not exist`,
      line,
      context,
    });
    return { valid: false, errors, warnings };
  }

  // Check if field exists
  const fields = loader.getModelFields(modelName);
  if (!fields.includes(fieldName)) {
    errors.push({
      type: 'field',
      message: `Field '${fieldName}' does not exist on model '${modelName}'`,
      line,
      context,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate enum value
 */
export function validateEnumValue(
  enumName: string,
  value: string,
  line?: number,
  context?: string
): ValidationResult {
  const loader = getTruthMapLoader();
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!loader.isValidEnumValue(enumName, value)) {
    const validValues = loader.getEnumValues(enumName);
    errors.push({
      type: 'enum',
      message: `Value '${value}' is not valid for enum '${enumName}'. Valid values: ${validValues.join(', ')}`,
      line,
      context,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate API endpoint reference
 */
export function validateEndpoint(
  controllerName: string,
  method: string,
  path: string,
  line?: number,
  context?: string
): ValidationResult {
  const loader = getTruthMapLoader();
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!loader.endpointExists(controllerName, method, path)) {
    errors.push({
      type: 'endpoint',
      message: `API endpoint '${method} ${path}' does not exist in controller '${controllerName}'`,
      line,
      context,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate service reference
 */
export function validateService(
  serviceName: string,
  line?: number,
  context?: string
): ValidationResult {
  const loader = getTruthMapLoader();
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!loader.serviceExists(serviceName)) {
    errors.push({
      type: 'service',
      message: `Service '${serviceName}' does not exist in services directory`,
      line,
      context,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate platform reference
 */
export function validatePlatform(
  platform: string,
  line?: number,
  context?: string
): ValidationResult {
  const loader = getTruthMapLoader();
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!loader.isPlatformSupported(platform)) {
    const supported = loader.getPlatforms();
    errors.push({
      type: 'platform',
      message: `Platform '${platform}' is not supported. Supported platforms: ${supported.join(', ')}`,
      line,
      context,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate external API reference
 */
export function validateExternalAPI(
  category: string,
  apiName: string,
  line?: number,
  context?: string
): ValidationResult {
  const loader = getTruthMapLoader();
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const api = loader.getExternalAPI(category, apiName);
  if (!api) {
    errors.push({
      type: 'external_api',
      message: `External API '${apiName}' in category '${category}' is not defined in TRUTH_MAP`,
      line,
      context,
    });
  } else if (api.status === 'not_implemented') {
    warnings.push({
      type: 'external_api',
      message: `External API '${apiName}' is defined but not implemented yet`,
      line,
      context,
    });
  } else if (api.status === 'planned') {
    warnings.push({
      type: 'external_api',
      message: `External API '${apiName}' is planned but not implemented`,
      line,
      context,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate an object against TRUTH_MAP
 * Automatically detects what type of validation to perform
 */
export function validateObject(obj: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for common patterns
  if (obj.model || obj.modelName) {
    const result = validateModel(obj.model || obj.modelName);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  if (obj.controller && obj.method && obj.path) {
    const result = validateEndpoint(obj.controller, obj.method, obj.path);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  if (obj.enumName && obj.value) {
    const result = validateEnumValue(obj.enumName, obj.value);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  if (obj.serviceName) {
    const result = validateService(obj.serviceName);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  if (obj.platform) {
    const result = validatePlatform(obj.platform);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate hallucination audit report
 */
export function generateAuditReport(
  moduleName: string,
  linesAnalyzed: number,
  results: ValidationResult[]
): string {
  const allErrors = results.flatMap((r) => r.errors);
  const allWarnings = results.flatMap((r) => r.warnings);

  const errorsByType = groupBy(allErrors, 'type');
  const totalHallucinations = allErrors.length;
  const confidenceScore = Math.max(
    0,
    100 - (totalHallucinations / linesAnalyzed) * 100
  ).toFixed(1);

  let report = `# Hallucination Audit — ${moduleName}\n\n`;
  report += `**Date**: ${new Date().toISOString().split('T')[0]}\n`;
  report += `**Auditor**: AI Validation System\n`;
  report += `**Module**: ${moduleName}\n`;
  report += `**Lines Analyzed**: ${linesAnalyzed}\n\n`;
  report += `## Summary\n\n`;
  report += `**Total Hallucinations Found**: ${totalHallucinations}\n`;
  report += `**Confidence Score**: ${confidenceScore}% (0-100)\n\n`;

  if (totalHallucinations === 0) {
    report += `✅ **No hallucinations detected!** All references are valid.\n\n`;
  } else {
    report += `## Findings\n\n`;

    for (const [type, errors] of Object.entries(errorsByType)) {
      report += `### ${capitalizeType(type)}\n\n`;
      errors.forEach((error) => {
        report += `- ${error.message}`;
        if (error.line) report += ` (line ${error.line})`;
        report += `\n`;
      });
      report += `\n`;
    }

    report += `## Recommended Fixes\n\n`;
    report += `1. Review all flagged references against TRUTH_MAP.yaml\n`;
    report += `2. Replace invented entities with valid ones from TRUTH_MAP\n`;
    report += `3. Re-run validation tests\n`;
    report += `4. Ensure confidence score reaches >90%\n\n`;
  }

  if (allWarnings.length > 0) {
    report += `## Warnings\n\n`;
    allWarnings.forEach((warning) => {
      report += `- ${warning.message}`;
      if (warning.line) report += ` (line ${warning.line})`;
      report += `\n`;
    });
    report += `\n`;
  }

  report += `## Verification Status\n\n`;
  report += `- [ ] All fixes applied\n`;
  report += `- [ ] Re-validated against TRUTH_MAP.yaml\n`;
  report += `- [ ] Tests pass\n`;
  report += `- [ ] Code review completed\n\n`;

  report += `---\n\n`;
  report += `**Audit Version**: 1.0.0\n`;
  report += `**TRUTH_MAP Version**: ${getTruthMapLoader().load().metadata.version}\n`;

  return report;
}

/**
 * Helper: Group array by key
 */
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Helper: Capitalize type name
 */
function capitalizeType(type: string): string {
  const typeMap: Record<string, string> = {
    model: 'Database Models',
    field: 'Model Fields',
    enum: 'Enum Values',
    endpoint: 'API Endpoints',
    service: 'Services',
    platform: 'Platforms',
    external_api: 'External APIs',
  };
  return typeMap[type] || type;
}
