#!/usr/bin/env ts-node
/**
 * TRUTH_MAP VALIDATION SCRIPT
 *
 * Validates TRUTH_MAP.yaml against the actual codebase to ensure
 * it stays in sync with schema.prisma, controllers, and services.
 *
 * Usage:
 *   npm run validate:truth-map
 *   ts-node scripts/validate-truth-map.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { glob } from 'glob';

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  details?: string;
}

const issues: ValidationIssue[] = [];

/**
 * Load TRUTH_MAP.yaml
 */
function loadTruthMap(): any {
  const truthMapPath = path.join(__dirname, '../docs/14-marketing-engine/TRUTH_MAP.yaml');

  if (!fs.existsSync(truthMapPath)) {
    console.error(`❌ TRUTH_MAP.yaml not found at: ${truthMapPath}`);
    process.exit(1);
  }

  const fileContents = fs.readFileSync(truthMapPath, 'utf8');
  return yaml.parse(fileContents);
}

/**
 * Extract models from schema.prisma
 */
function extractSchemaModels(): string[] {
  const schemaPath = path.join(__dirname, '../packages/database/prisma/schema.prisma');

  if (!fs.existsSync(schemaPath)) {
    issues.push({
      severity: 'error',
      category: 'schema',
      message: 'schema.prisma not found',
      details: schemaPath,
    });
    return [];
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const modelRegex = /^model\s+(\w+)\s*\{/gm;
  const models: string[] = [];

  let match;
  while ((match = modelRegex.exec(schemaContent)) !== null) {
    models.push(match[1]);
  }

  return models;
}

/**
 * Extract enums from schema.prisma
 */
function extractSchemaEnums(): string[] {
  const schemaPath = path.join(__dirname, '../packages/database/prisma/schema.prisma');

  if (!fs.existsSync(schemaPath)) {
    return [];
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const enumRegex = /^enum\s+(\w+)\s*\{/gm;
  const enums: string[] = [];

  let match;
  while ((match = enumRegex.exec(schemaContent)) !== null) {
    enums.push(match[1]);
  }

  return enums;
}

/**
 * Extract service files
 */
async function extractServiceFiles(): Promise<string[]> {
  const servicesPath = path.join(
    __dirname,
    '../apps/api/src/modules/marketing/services/**/*.service.ts'
  );

  const files = await glob(servicesPath);

  return files.map((file) => {
    const basename = path.basename(file, '.service.ts');
    // Convert kebab-case to PascalCase
    return basename
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Service';
  });
}

/**
 * Extract controller files
 */
async function extractControllers(): Promise<string[]> {
  const controllersPath = path.join(
    __dirname,
    '../apps/api/src/modules/marketing/controllers/*.controller.ts'
  );

  const files = await glob(controllersPath);

  return files.map((file) => {
    const basename = path.basename(file, '.controller.ts');
    return basename.replace(/-/g, '_');
  });
}

/**
 * Validate database models
 */
function validateDatabaseModels(truthMap: any): void {
  console.log('\n📊 Validating database models...');

  const schemaModels = extractSchemaModels();
  const truthMapModels = Object.keys(truthMap.database_models || {});

  // Check for models in schema but not in TRUTH_MAP
  const missingInTruthMap = schemaModels.filter(
    (model) => !truthMapModels.includes(model)
  );

  if (missingInTruthMap.length > 0) {
    issues.push({
      severity: 'warning',
      category: 'database_models',
      message: `${missingInTruthMap.length} models in schema.prisma but not in TRUTH_MAP`,
      details: missingInTruthMap.join(', '),
    });
  }

  // Check for models in TRUTH_MAP but not in schema
  const missingInSchema = truthMapModels.filter(
    (model) => !schemaModels.includes(model)
  );

  if (missingInSchema.length > 0) {
    issues.push({
      severity: 'error',
      category: 'database_models',
      message: `${missingInSchema.length} models in TRUTH_MAP but not in schema.prisma`,
      details: missingInSchema.join(', '),
    });
  }

  if (missingInTruthMap.length === 0 && missingInSchema.length === 0) {
    console.log(`✅ All ${schemaModels.length} models are synchronized`);
  }
}

/**
 * Validate enums
 */
function validateEnums(truthMap: any): void {
  console.log('\n📝 Validating enums...');

  const schemaEnums = extractSchemaEnums();
  const truthMapEnums = Object.keys(truthMap.enums || {});

  const missingInTruthMap = schemaEnums.filter(
    (enumName) => !truthMapEnums.includes(enumName)
  );

  if (missingInTruthMap.length > 0) {
    issues.push({
      severity: 'warning',
      category: 'enums',
      message: `${missingInTruthMap.length} enums in schema.prisma but not in TRUTH_MAP`,
      details: missingInTruthMap.join(', '),
    });
  }

  const missingInSchema = truthMapEnums.filter(
    (enumName) => !schemaEnums.includes(enumName)
  );

  if (missingInSchema.length > 0) {
    issues.push({
      severity: 'error',
      category: 'enums',
      message: `${missingInSchema.length} enums in TRUTH_MAP but not in schema.prisma`,
      details: missingInSchema.join(', '),
    });
  }

  if (missingInTruthMap.length === 0 && missingInSchema.length === 0) {
    console.log(`✅ All ${schemaEnums.length} enums are synchronized`);
  }
}

/**
 * Validate services
 */
async function validateServices(truthMap: any): Promise<void> {
  console.log('\n⚙️  Validating services...');

  const serviceFiles = await extractServiceFiles();
  const truthMapServices = Object.values(truthMap.services || {})
    .flat() as string[];

  const fileServiceNames = new Set(serviceFiles);
  const missingInFiles = truthMapServices.filter(
    (service) => !fileServiceNames.has(service)
  );

  if (missingInFiles.length > 0) {
    issues.push({
      severity: 'warning',
      category: 'services',
      message: `${missingInFiles.length} services in TRUTH_MAP but files not found`,
      details: missingInFiles.slice(0, 10).join(', ') + (missingInFiles.length > 10 ? '...' : ''),
    });
  }

  console.log(`✅ Found ${serviceFiles.length} service files`);
  console.log(`📌 TRUTH_MAP lists ${truthMapServices.length} services`);
}

/**
 * Validate controllers
 */
async function validateControllers(truthMap: any): Promise<void> {
  console.log('\n🎮 Validating controllers...');

  const controllerFiles = await extractControllers();
  const truthMapControllers = Object.keys(truthMap.api_endpoints?.controllers || {});

  const missingInTruthMap = controllerFiles.filter(
    (controller) => !truthMapControllers.includes(controller)
  );

  if (missingInTruthMap.length > 0) {
    issues.push({
      severity: 'warning',
      category: 'controllers',
      message: `${missingInTruthMap.length} controller files but not in TRUTH_MAP`,
      details: missingInTruthMap.join(', '),
    });
  }

  const missingFiles = truthMapControllers.filter(
    (controller) => !controllerFiles.includes(controller)
  );

  if (missingFiles.length > 0) {
    issues.push({
      severity: 'error',
      category: 'controllers',
      message: `${missingFiles.length} controllers in TRUTH_MAP but files not found`,
      details: missingFiles.join(', '),
    });
  }

  if (missingInTruthMap.length === 0 && missingFiles.length === 0) {
    console.log(`✅ All ${controllerFiles.length} controllers are synchronized`);
  }
}

/**
 * Validate TRUTH_MAP structure
 */
function validateStructure(truthMap: any): void {
  console.log('\n🏗️  Validating TRUTH_MAP structure...');

  const requiredSections = [
    'metadata',
    'database_models',
    'enums',
    'platforms',
    'api_endpoints',
    'services',
    'external_apis',
    'validation_rules',
  ];

  const missingSections = requiredSections.filter(
    (section) => !(section in truthMap)
  );

  if (missingSections.length > 0) {
    issues.push({
      severity: 'error',
      category: 'structure',
      message: 'Missing required sections in TRUTH_MAP',
      details: missingSections.join(', '),
    });
  } else {
    console.log('✅ All required sections present');
  }

  // Validate metadata
  if (truthMap.metadata) {
    const requiredMetadata = ['version', 'last_updated'];
    const missingMetadata = requiredMetadata.filter(
      (field) => !(field in truthMap.metadata)
    );

    if (missingMetadata.length > 0) {
      issues.push({
        severity: 'warning',
        category: 'metadata',
        message: 'Missing metadata fields',
        details: missingMetadata.join(', '),
      });
    }
  }
}

/**
 * Print summary report
 */
function printSummary(): void {
  console.log('\n' + '='.repeat(60));
  console.log('📋 VALIDATION SUMMARY');
  console.log('='.repeat(60));

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  if (issues.length === 0) {
    console.log('\n✅ No issues found! TRUTH_MAP is fully synchronized.\n');
    return;
  }

  if (errors.length > 0) {
    console.log(`\n❌ ERRORS (${errors.length}):`);
    errors.forEach((issue, index) => {
      console.log(`\n${index + 1}. [${issue.category}] ${issue.message}`);
      if (issue.details) {
        console.log(`   ${issue.details}`);
      }
    });
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach((issue, index) => {
      console.log(`\n${index + 1}. [${issue.category}] ${issue.message}`);
      if (issue.details) {
        console.log(`   ${issue.details}`);
      }
    });
  }

  if (infos.length > 0) {
    console.log(`\nℹ️  INFO (${infos.length}):`);
    infos.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.category}] ${issue.message}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Total issues: ${issues.length} (${errors.length} errors, ${warnings.length} warnings)`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Main validation function
 */
async function main(): Promise<void> {
  console.log('🔍 DryJets TRUTH_MAP Validation\n');
  console.log('Loading TRUTH_MAP.yaml...');

  const truthMap = loadTruthMap();
  console.log(`✅ Loaded TRUTH_MAP version ${truthMap.metadata?.version || 'unknown'}\n`);

  // Run validations
  validateStructure(truthMap);
  validateDatabaseModels(truthMap);
  validateEnums(truthMap);
  await validateServices(truthMap);
  await validateControllers(truthMap);

  // Print summary
  printSummary();

  // Exit with error code if there are errors
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  if (errorCount > 0) {
    console.log('❌ Validation failed with errors. Please update TRUTH_MAP.yaml.\n');
    process.exit(1);
  } else {
    console.log('✅ Validation passed!\n');
    process.exit(0);
  }
}

// Run validation
main().catch((error) => {
  console.error('❌ Validation script failed:');
  console.error(error);
  process.exit(1);
});
