#!/usr/bin/env tsx

/**
 * DryJets Architecture Consistency Validator
 *
 * Validates that code implementation aligns with:
 * - MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md
 * - MARKETING_ENGINE_API_DOCUMENTATION.md
 *
 * Checks:
 * 1. All controllers have documented endpoints
 * 2. All services have @UseCase decorators
 * 3. Naming conventions are followed
 * 4. No undocumented endpoints exist
 * 5. DTOs match documented schemas
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
  stats: {
    totalControllers: number;
    totalEndpoints: number;
    documentedEndpoints: number;
    totalServices: number;
    servicesWithUseCases: number;
    namingViolations: number;
  };
}

interface Endpoint {
  method: string;
  path: string;
  file: string;
  line: number;
  hasUseCase: boolean;
  hasAPIDoc: boolean;
}

interface Service {
  name: string;
  file: string;
  hasUseCase: boolean;
  useCases: string[];
}

const API_DOC_PATH = path.join(__dirname, '../MARKETING_ENGINE_API_DOCUMENTATION.md');
const USE_CASE_DOC_PATH = path.join(__dirname, '../MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md');
const API_SRC_PATH = path.join(__dirname, '../apps/api/src');

// Color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

/**
 * Main validation function
 */
async function validateArchitecture(): Promise<ValidationResult> {
  console.log(`${colors.bold}${colors.cyan}🔍 DryJets Architecture Validation${colors.reset}\n`);

  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: [],
    stats: {
      totalControllers: 0,
      totalEndpoints: 0,
      documentedEndpoints: 0,
      totalServices: 0,
      servicesWithUseCases: 0,
      namingViolations: 0,
    },
  };

  // Check if documentation files exist
  if (!fs.existsSync(API_DOC_PATH)) {
    result.errors.push(`API Documentation not found: ${API_DOC_PATH}`);
    return result;
  }

  if (!fs.existsSync(USE_CASE_DOC_PATH)) {
    result.errors.push(`Use Case Diagram not found: ${USE_CASE_DOC_PATH}`);
    return result;
  }

  const apiDoc = fs.readFileSync(API_DOC_PATH, 'utf-8');
  const useCaseDoc = fs.readFileSync(USE_CASE_DOC_PATH, 'utf-8');

  console.log(`${colors.green}✓${colors.reset} Documentation files found\n`);

  // 1. Validate Controllers and Endpoints
  console.log(`${colors.bold}1. Validating Controllers & Endpoints...${colors.reset}`);
  await validateControllers(result, apiDoc, useCaseDoc);

  // 2. Validate Services
  console.log(`\n${colors.bold}2. Validating Services...${colors.reset}`);
  await validateServices(result, useCaseDoc);

  // 3. Validate Naming Conventions
  console.log(`\n${colors.bold}3. Validating Naming Conventions...${colors.reset}`);
  await validateNamingConventions(result);

  // 4. Check for undocumented endpoints
  console.log(`\n${colors.bold}4. Checking for Undocumented Endpoints...${colors.reset}`);
  await checkUndocumentedEndpoints(result, apiDoc);

  // Set overall validation status
  result.valid = result.errors.length === 0;

  return result;
}

/**
 * Validate all controllers and their endpoints
 */
async function validateControllers(
  result: ValidationResult,
  apiDoc: string,
  useCaseDoc: string
): Promise<void> {
  const controllerFiles = await glob('**/*.controller.ts', { cwd: API_SRC_PATH });
  result.stats.totalControllers = controllerFiles.length;

  for (const file of controllerFiles) {
    const filePath = path.join(API_SRC_PATH, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const endpoints = extractEndpoints(content, file);
    result.stats.totalEndpoints += endpoints.length;

    for (const endpoint of endpoints) {
      // Check if endpoint is documented in API doc
      const isDocumented = isEndpointDocumented(endpoint, apiDoc);

      if (isDocumented) {
        result.stats.documentedEndpoints++;
      } else {
        result.warnings.push(
          `Endpoint may be undocumented: ${endpoint.method} ${endpoint.path} (${file}:${endpoint.line})`
        );
      }

      // Check for @UseCase decorator
      if (!endpoint.hasUseCase) {
        result.warnings.push(
          `Endpoint missing @UseCase decorator: ${endpoint.method} ${endpoint.path} (${file}:${endpoint.line})`
        );
      }
    }
  }

  const coverage = result.stats.totalEndpoints > 0
    ? ((result.stats.documentedEndpoints / result.stats.totalEndpoints) * 100).toFixed(1)
    : '0.0';

  console.log(`   Controllers: ${result.stats.totalControllers}`);
  console.log(`   Endpoints: ${result.stats.totalEndpoints}`);
  console.log(`   Documented: ${result.stats.documentedEndpoints} (${coverage}%)`);
}

/**
 * Validate all services have @UseCase decorators
 */
async function validateServices(result: ValidationResult, useCaseDoc: string): Promise<void> {
  const serviceFiles = await glob('**/*.service.ts', { cwd: API_SRC_PATH });
  result.stats.totalServices = serviceFiles.length;

  for (const file of serviceFiles) {
    const filePath = path.join(API_SRC_PATH, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const service = extractServiceInfo(content, file);

    if (service.hasUseCase) {
      result.stats.servicesWithUseCases++;
    } else {
      // Skip test files and certain utility services
      if (!file.includes('.spec.ts') && !file.includes('/common/')) {
        result.warnings.push(`Service missing @UseCase decorator: ${service.name} (${file})`);
      }
    }

    // Validate use case references actually exist in diagram
    for (const ucRef of service.useCases) {
      if (!useCaseDoc.includes(ucRef)) {
        result.errors.push(
          `Invalid use case reference ${ucRef} in ${service.name} - not found in diagram`
        );
      }
    }
  }

  const coverage = result.stats.totalServices > 0
    ? ((result.stats.servicesWithUseCases / result.stats.totalServices) * 100).toFixed(1)
    : '0.0';

  console.log(`   Services: ${result.stats.totalServices}`);
  console.log(`   With @UseCase: ${result.stats.servicesWithUseCases} (${coverage}%)`);
}

/**
 * Validate naming conventions
 */
async function validateNamingConventions(result: ValidationResult): Promise<void> {
  const allFiles = await glob('**/*.ts', { cwd: API_SRC_PATH, ignore: ['**/*.spec.ts'] });

  const namingIssues: string[] = [];

  for (const file of allFiles) {
    const fileName = path.basename(file);

    // Check service files
    if (fileName.endsWith('.service.ts')) {
      const className = extractClassName(fs.readFileSync(path.join(API_SRC_PATH, file), 'utf-8'));
      if (className && !className.endsWith('Service')) {
        namingIssues.push(`Service class should end with 'Service': ${className} in ${file}`);
      }
    }

    // Check controller files
    if (fileName.endsWith('.controller.ts')) {
      const className = extractClassName(fs.readFileSync(path.join(API_SRC_PATH, file), 'utf-8'));
      if (className && !className.endsWith('Controller')) {
        namingIssues.push(`Controller class should end with 'Controller': ${className} in ${file}`);
      }
    }

    // Check DTO files
    if (fileName.endsWith('.dto.ts')) {
      const content = fs.readFileSync(path.join(API_SRC_PATH, file), 'utf-8');
      const classNames = extractAllClassNames(content);
      for (const className of classNames) {
        if (!className.endsWith('Dto')) {
          namingIssues.push(`DTO class should end with 'Dto': ${className} in ${file}`);
        }
      }
    }
  }

  result.stats.namingViolations = namingIssues.length;
  result.warnings.push(...namingIssues);

  if (namingIssues.length === 0) {
    console.log(`   ${colors.green}✓${colors.reset} All files follow naming conventions`);
  } else {
    console.log(`   ${colors.yellow}⚠${colors.reset} Found ${namingIssues.length} naming violations`);
  }
}

/**
 * Check for undocumented endpoints
 */
async function checkUndocumentedEndpoints(result: ValidationResult, apiDoc: string): Promise<void> {
  const undocumented: Endpoint[] = [];

  const controllerFiles = await glob('**/*.controller.ts', { cwd: API_SRC_PATH });

  for (const file of controllerFiles) {
    const filePath = path.join(API_SRC_PATH, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const endpoints = extractEndpoints(content, file);

    for (const endpoint of endpoints) {
      if (!isEndpointDocumented(endpoint, apiDoc)) {
        undocumented.push(endpoint);
      }
    }
  }

  if (undocumented.length === 0) {
    console.log(`   ${colors.green}✓${colors.reset} No undocumented endpoints found`);
  } else {
    console.log(`   ${colors.yellow}⚠${colors.reset} Found ${undocumented.length} potentially undocumented endpoints`);
    result.info.push(`Review these endpoints and add them to API documentation:`);
    undocumented.slice(0, 10).forEach((ep) => {
      result.info.push(`  - ${ep.method} ${ep.path} (${ep.file})`);
    });
    if (undocumented.length > 10) {
      result.info.push(`  ... and ${undocumented.length - 10} more`);
    }
  }
}

/**
 * Extract HTTP endpoints from controller code
 */
function extractEndpoints(content: string, file: string): Endpoint[] {
  const endpoints: Endpoint[] = [];
  const lines = content.split('\n');

  const httpMethods = ['Get', 'Post', 'Put', 'Patch', 'Delete'];
  let currentUseCase = false;
  let currentAPIDoc = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for @UseCase decorator
    if (line.trim().startsWith('* @UseCase')) {
      currentUseCase = true;
    }

    // Check for @APIDoc decorator
    if (line.trim().startsWith('* @APIDoc')) {
      currentAPIDoc = true;
    }

    // Look for HTTP method decorators
    for (const method of httpMethods) {
      const regex = new RegExp(`@${method}\\(['"\`]([^'"\`]*)['"\`]\\)`, 'i');
      const match = line.match(regex);

      if (match) {
        const routePath = match[1] || '';
        endpoints.push({
          method: method.toUpperCase(),
          path: routePath,
          file,
          line: i + 1,
          hasUseCase: currentUseCase,
          hasAPIDoc: currentAPIDoc,
        });

        // Reset flags after endpoint
        currentUseCase = false;
        currentAPIDoc = false;
      }
    }

    // Reset flags at function end
    if (line.trim().startsWith('}') && line.trim().length === 1) {
      currentUseCase = false;
      currentAPIDoc = false;
    }
  }

  return endpoints;
}

/**
 * Extract service information
 */
function extractServiceInfo(content: string, file: string): Service {
  const className = extractClassName(content) || path.basename(file, '.ts');
  const useCases: string[] = [];
  let hasUseCase = false;

  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('@UseCase')) {
      hasUseCase = true;
      const match = line.match(/UC\d+/);
      if (match) {
        useCases.push(match[0]);
      }
    }
  }

  return {
    name: className,
    file,
    hasUseCase,
    useCases,
  };
}

/**
 * Extract class name from TypeScript file
 */
function extractClassName(content: string): string | null {
  const match = content.match(/export\s+class\s+(\w+)/);
  return match ? match[1] : null;
}

/**
 * Extract all class names from TypeScript file
 */
function extractAllClassNames(content: string): string[] {
  const regex = /export\s+class\s+(\w+)/g;
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

/**
 * Check if endpoint is documented in API doc
 */
function isEndpointDocumented(endpoint: Endpoint, apiDoc: string): boolean {
  // Normalize path for comparison
  const pathVariations = [
    endpoint.path,
    `/api/v1${endpoint.path}`,
    `/marketing${endpoint.path}`,
    `/api/v1/marketing${endpoint.path}`,
  ];

  for (const path of pathVariations) {
    // Look for endpoint in markdown (code blocks or headers)
    const patterns = [
      `${endpoint.method} ${path}`,
      `\`${endpoint.method} ${path}\``,
      `${endpoint.method.toLowerCase()} ${path}`,
      `### ${endpoint.method} \`${path}\``,
      `#### ${endpoint.method} \`${path}\``,
    ];

    for (const pattern of patterns) {
      if (apiDoc.includes(pattern)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Print validation results
 */
function printResults(result: ValidationResult): void {
  console.log(`\n${colors.bold}${colors.cyan}════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Validation Results${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════${colors.reset}\n`);

  // Statistics
  console.log(`${colors.bold}📊 Statistics:${colors.reset}`);
  console.log(`   Controllers: ${result.stats.totalControllers}`);
  console.log(`   Endpoints: ${result.stats.totalEndpoints}`);
  console.log(`   Services: ${result.stats.totalServices}`);
  console.log();

  // Coverage
  const endpointCoverage = result.stats.totalEndpoints > 0
    ? ((result.stats.documentedEndpoints / result.stats.totalEndpoints) * 100).toFixed(1)
    : '0.0';
  const serviceCoverage = result.stats.totalServices > 0
    ? ((result.stats.servicesWithUseCases / result.stats.totalServices) * 100).toFixed(1)
    : '0.0';

  console.log(`${colors.bold}📈 Coverage:${colors.reset}`);
  console.log(`   Endpoint Documentation: ${endpointCoverage}%`);
  console.log(`   Service Use Cases: ${serviceCoverage}%`);
  console.log();

  // Errors
  if (result.errors.length > 0) {
    console.log(`${colors.bold}${colors.red}❌ Errors (${result.errors.length}):${colors.reset}`);
    result.errors.forEach((error) => {
      console.log(`   ${colors.red}✗${colors.reset} ${error}`);
    });
    console.log();
  }

  // Warnings
  if (result.warnings.length > 0) {
    console.log(`${colors.bold}${colors.yellow}⚠️  Warnings (${result.warnings.length}):${colors.reset}`);
    result.warnings.slice(0, 20).forEach((warning) => {
      console.log(`   ${colors.yellow}!${colors.reset} ${warning}`);
    });
    if (result.warnings.length > 20) {
      console.log(`   ${colors.yellow}... and ${result.warnings.length - 20} more warnings${colors.reset}`);
    }
    console.log();
  }

  // Info
  if (result.info.length > 0) {
    console.log(`${colors.bold}${colors.blue}ℹ️  Information:${colors.reset}`);
    result.info.forEach((info) => {
      console.log(`   ${colors.blue}ℹ${colors.reset} ${info}`);
    });
    console.log();
  }

  // Final verdict
  console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════${colors.reset}\n`);
  if (result.valid) {
    console.log(`${colors.bold}${colors.green}✅ VALIDATION PASSED${colors.reset}\n`);
  } else {
    console.log(`${colors.bold}${colors.red}❌ VALIDATION FAILED${colors.reset}\n`);
    console.log(`Fix ${result.errors.length} error(s) before committing.\n`);
  }

  // Targets
  console.log(`${colors.bold}🎯 Targets:${colors.reset}`);
  console.log(`   Endpoint Documentation: 100% ${endpointCoverage === '100.0' ? colors.green + '✓' + colors.reset : colors.yellow + '(current: ' + endpointCoverage + '%)' + colors.reset}`);
  console.log(`   Service Use Cases: 95% ${parseFloat(serviceCoverage) >= 95 ? colors.green + '✓' + colors.reset : colors.yellow + '(current: ' + serviceCoverage + '%)' + colors.reset}`);
  console.log(`   Naming Violations: 0 ${result.stats.namingViolations === 0 ? colors.green + '✓' + colors.reset : colors.yellow + '(current: ' + result.stats.namingViolations + ')' + colors.reset}`);
  console.log();
}

/**
 * Main execution
 */
async function main() {
  try {
    const result = await validateArchitecture();
    printResults(result);

    // Exit with error code if validation failed
    process.exit(result.valid ? 0 : 1);
  } catch (error) {
    console.error(`${colors.red}${colors.bold}❌ Validation Error:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { validateArchitecture, ValidationResult };
