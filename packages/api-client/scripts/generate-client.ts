#!/usr/bin/env tsx

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const OPENAPI_JSON_PATH = path.join(__dirname, '../../../apps/api/openapi.json');
const GENERATED_PATH = path.join(__dirname, '../src/generated');

async function generateClient() {
  console.log('🚀 Starting API client generation...\n');

  // Step 1: Check if API is running or openapi.json exists
  console.log('📡 Step 1: Checking for OpenAPI specification...');

  let openapiSpec: any;

  if (fs.existsSync(OPENAPI_JSON_PATH)) {
    console.log(`✅ Found existing OpenAPI spec at: ${OPENAPI_JSON_PATH}`);
    openapiSpec = JSON.parse(fs.readFileSync(OPENAPI_JSON_PATH, 'utf-8'));
  } else {
    console.log(`⚠️  OpenAPI spec not found at: ${OPENAPI_JSON_PATH}`);
    console.log(`💡 To generate the OpenAPI spec:`);
    console.log(`   1. Start the API: cd apps/api && npm run start`);
    console.log(`   2. The spec will be available at: ${API_URL}/api-json`);
    console.log(`   3. Or build the API to generate openapi.json`);
    process.exit(1);
  }

  // Step 2: Validate OpenAPI spec
  console.log('\n🔍 Step 2: Validating OpenAPI specification...');
  if (!openapiSpec.paths || Object.keys(openapiSpec.paths).length === 0) {
    console.error('❌ OpenAPI spec is invalid or empty');
    process.exit(1);
  }
  console.log(`✅ Found ${Object.keys(openapiSpec.paths).length} API endpoints`);

  // Step 3: Clean previous generated files
  console.log('\n🧹 Step 3: Cleaning previous generated files...');
  if (fs.existsSync(GENERATED_PATH)) {
    fs.rmSync(GENERATED_PATH, { recursive: true, force: true });
  }
  fs.mkdirSync(GENERATED_PATH, { recursive: true });
  console.log('✅ Cleaned generated directory');

  // Step 4: Generate TypeScript client
  console.log('\n⚙️  Step 4: Generating TypeScript client...');
  try {
    execSync('npx @hey-api/openapi-ts', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
    console.log('✅ TypeScript client generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate TypeScript client:', error);
    process.exit(1);
  }

  // Step 5: Verify generated files
  console.log('\n✅ Step 5: Verifying generated files...');
  const generatedFiles = fs.readdirSync(GENERATED_PATH);
  console.log(`   Generated ${generatedFiles.length} files:`);
  generatedFiles.forEach((file) => {
    console.log(`   - ${file}`);
  });

  console.log('\n🎉 API client generation complete!\n');
  console.log('📦 Import in your app:');
  console.log('   import { client } from \'@dryjets/api-client\';');
  console.log('   import type { User, Order } from \'@dryjets/api-client\';');
}

generateClient().catch((error) => {
  console.error('❌ Generation failed:', error);
  process.exit(1);
});
