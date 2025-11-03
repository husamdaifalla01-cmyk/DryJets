# AI Validation Test Suite

## Purpose

This test suite validates AI-generated code against the canonical [TRUTH_MAP.yaml](../../docs/14-marketing-engine/TRUTH_MAP.yaml) to prevent hallucinations and ensure all references (models, enums, endpoints, services) are factually correct.

## Test Files

### 1. [schema.validation.test.ts](./schema.validation.test.ts)
Validates database model and field references.

**Tests:**
- Model existence validation
- Field existence on models
- Relationship references
- Common typos and hallucinations

**Coverage:**
- 150+ database models from schema.prisma
- All Marketing Engine models
- IoT/Equipment models
- Offer Lab models

### 2. [enum.validation.test.ts](./enum.validation.test.ts)
Validates enum values against defined enums.

**Tests:**
- Valid enum value checks
- Case sensitivity validation
- Frontend/backend enum mapping
- Plausible but invented values

**Coverage:**
- 40+ enums (UserRole, CampaignType, OrderStatus, etc.)
- Marketing Engine enums
- Equipment & IoT enums
- SEO & Content enums

### 3. [endpoint.validation.test.ts](./endpoint.validation.test.ts)
Validates API endpoint references.

**Tests:**
- Controller endpoint existence
- HTTP method validation
- Path correctness
- Platform support

**Coverage:**
- 337+ API endpoints across 14 controllers
- All CRUD operations
- Workflow endpoints
- Platform-specific endpoints

### 4. [service.validation.test.ts](./service.validation.test.ts)
Validates service and external API references.

**Tests:**
- Service existence validation
- External API integration status
- Service category organization
- API implementation status

**Coverage:**
- 80+ services across 13 categories
- External trend sources (Google, Twitter, Reddit, TikTok)
- AI providers (Claude, OpenAI)
- Video generation APIs

## Running Tests

### Run All Validation Tests

```bash
npm test -- tests/ai-validation
```

### Run Specific Test File

```bash
# Schema validation only
npm test -- tests/ai-validation/schema.validation.test.ts

# Enum validation only
npm test -- tests/ai-validation/enum.validation.test.ts

# Endpoint validation only
npm test -- tests/ai-validation/endpoint.validation.test.ts

# Service validation only
npm test -- tests/ai-validation/service.validation.test.ts
```

### Watch Mode

```bash
npm test -- tests/ai-validation --watch
```

### Coverage Report

```bash
npm test -- tests/ai-validation --coverage
```

## Helper Utilities

### [truth-loader.ts](./helpers/truth-loader.ts)

Loads and parses TRUTH_MAP.yaml, provides query methods:

```typescript
import { getTruthMapLoader } from './helpers/truth-loader';

const loader = getTruthMapLoader();

// Check if model exists
loader.modelExists('Campaign'); // true
loader.modelExists('FakeModel'); // false

// Get model fields
const fields = loader.getModelFields('User');
// ['id', 'email', 'role', 'status', 'passwordHash']

// Validate enum value
loader.isValidEnumValue('CampaignStatus', 'ACTIVE'); // true
loader.isValidEnumValue('CampaignStatus', 'INVALID'); // false

// Check endpoint
loader.endpointExists('campaigns', 'POST', '/:id/start'); // true

// Check service
loader.serviceExists('TrendCollectorService'); // true

// Check external API
loader.isExternalAPIImplemented('trend_sources', 'google_trends'); // true
```

### [validators.ts](./helpers/validators.ts)

Validation functions with detailed error reporting:

```typescript
import {
  validateModel,
  validateModelField,
  validateEnumValue,
  validateEndpoint,
  validateService,
  validateExternalAPI,
  generateAuditReport,
} from './helpers/validators';

// Validate model
const result = validateModel('Campaign');
if (!result.valid) {
  console.error(result.errors);
}

// Validate field
const fieldResult = validateModelField('Campaign', 'budget');
// { valid: true, errors: [], warnings: [] }

// Generate audit report
const results = [
  validateModel('FakeModel'),
  validateEnumValue('CampaignStatus', 'INVALID'),
];
const report = generateAuditReport('my-module', 100, results);
// Generates markdown audit report
```

## Integration with Development Workflow

### 1. Pre-Commit Validation

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm test -- tests/ai-validation --passWithNoTests
if [ $? -ne 0 ]; then
  echo "❌ AI validation failed. Fix hallucinations before committing."
  exit 1
fi
```

### 2. CI/CD Pipeline

Add to `.github/workflows/ci.yml`:

```yaml
- name: Run AI Validation Tests
  run: npm test -- tests/ai-validation
```

### 3. AI Code Generation Workflow

When generating code with AI:

1. **Reference TRUTH_MAP first**
   ```typescript
   // ✅ Good: Check TRUTH_MAP before using
   const loader = getTruthMapLoader();
   const validStatuses = loader.getEnumValues('CampaignStatus');
   ```

2. **Validate after generation**
   ```bash
   npm test -- tests/ai-validation
   ```

3. **Generate audit report**
   ```bash
   npm run audit:generate -- --module="offer-lab/phase-1"
   ```

4. **Fix hallucinations**
   - Review errors
   - Update code to match TRUTH_MAP
   - Re-run tests

## Common Hallucinations Detected

### 1. **Model Name Typos**
```typescript
// ❌ Hallucination
const campaign = await prisma.campain.findMany();

// ✅ Correct
const campaign = await prisma.campaign.findMany();
```

### 2. **Invented Fields**
```typescript
// ❌ Hallucination (createdBy doesn't exist)
campaign.createdBy

// ✅ Correct (use actual fields from TRUTH_MAP)
campaign.profileId
```

### 3. **Invalid Enum Values**
```typescript
// ❌ Hallucination
status: 'PENDING' // CampaignStatus doesn't have PENDING

// ✅ Correct
status: 'DRAFT' // Valid value from TRUTH_MAP
```

### 4. **Non-existent Endpoints**
```typescript
// ❌ Hallucination
POST /api/marketing/campaigns/:id/execute

// ✅ Correct
POST /api/marketing/campaigns/:id/start
```

### 5. **Invented Services**
```typescript
// ❌ Hallucination
import { CampaignGeneratorService } from '...';

// ✅ Correct
import { TrendCollectorService } from '...';
```

### 6. **Unsupported Platforms**
```typescript
// ❌ Hallucination
platform: 'snapchat'

// ✅ Correct (check platforms.supported in TRUTH_MAP)
platform: 'tiktok'
```

### 7. **Non-existent External APIs**
```typescript
// ❌ Hallucination
const data = await buzzsumoAPI.getTrends();

// ✅ Correct (check external_apis in TRUTH_MAP)
const data = await googleTrendsAPI.getTrends();
```

## Test Writing Guidelines

### Structure

```typescript
describe('Feature Validation', () => {
  let loader: ReturnType<typeof getTruthMapLoader>;

  beforeAll(() => {
    loader = getTruthMapLoader();
    loader.load();
  });

  test('should validate correct usage', () => {
    const result = validateModel('Campaign');
    expect(result.valid).toBe(true);
  });

  test('should reject hallucinations', () => {
    const result = validateModel('FakeModel');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

### Best Practices

1. **Test both valid and invalid cases**
2. **Include real-world hallucination scenarios**
3. **Test case sensitivity**
4. **Test plausible but incorrect values**
5. **Verify error messages are helpful**

## Maintenance

### Updating TRUTH_MAP

When schema.prisma or API endpoints change:

1. Update [TRUTH_MAP.yaml](../../docs/14-marketing-engine/TRUTH_MAP.yaml)
2. Run validation tests
3. Update test expectations if needed
4. Increment TRUTH_MAP version

### Adding New Tests

When adding new features:

1. Update TRUTH_MAP with new models/endpoints
2. Add corresponding validation tests
3. Run full test suite
4. Generate audit report

## Metrics & Goals

| Metric | Target | Current |
|--------|--------|---------|
| Test Coverage | >90% | TBD |
| Hallucination Detection Rate | >95% | TBD |
| False Positives | <5% | TBD |
| Test Execution Time | <10s | TBD |

## Troubleshooting

### TRUTH_MAP Not Found

```bash
Error: Failed to load TRUTH_MAP.yaml
```

**Solution:** Ensure TRUTH_MAP.yaml exists at:
```
/docs/14-marketing-engine/TRUTH_MAP.yaml
```

### YAML Parse Error

```bash
Error: YAML parse failed
```

**Solution:** Validate YAML syntax:
```bash
npm run validate:yaml
```

### Test Failures After Schema Change

**Solution:** Update TRUTH_MAP.yaml to match new schema, then re-run tests.

## Related Documentation

- [TRUTH_MAP.yaml](../../docs/14-marketing-engine/TRUTH_MAP.yaml) - Canonical source of truth
- [Hallucination Audit README](../../docs/15-validations/HALLUCINATION_AUDITS/README.md) - Audit process
- [Anti-Hallucination Protocol](../../CLAUDE_CODE_PROMPT_TEMPLATE.md) - AI development guidelines
- [Schema Documentation](../../packages/database/prisma/schema.prisma) - Database schema

## Support

For issues or questions:

1. Check if TRUTH_MAP is up to date
2. Review test error messages
3. Consult Anti-Hallucination Protocol
4. Create issue with test failure details

---

**Last Updated**: 2025-10-31
**Maintained By**: AI Anti-Hallucination Protocol Team
**Version**: 1.0.0
