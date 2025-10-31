# DryJets Architectural Governance Framework

**Version**: 1.0
**Effective Date**: 2025-10-29
**Status**: Mandatory for all development

---

## 🧭 The North Star Principle

The DryJets platform is governed by **two authoritative documents** that define all system behavior and communication:

1. **[MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md](./MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md)** - Defines WHAT the system does (behaviors)
2. **[MARKETING_ENGINE_API_DOCUMENTATION.md](./MARKETING_ENGINE_API_DOCUMENTATION.md)** - Defines HOW it communicates (interfaces)

### The Golden Rule

> **"No feature exists in code unless it exists in the diagram or documentation."**

- The **diagram defines reality** (system behavior)
- The **API doc defines communication** (system language)
- The **code implements both** (system execution)

---

## 🎯 Core Governance Principles

### Principle 1: Use Case Traceability

**Every class, endpoint, and workflow must trace back to a use case.**

#### Implementation Rules:
- No new modules created without corresponding use case
- No new API endpoints without documented specification
- No new features without diagram update

#### Enforcement:
```typescript
/**
 * @UseCase UC070 - Determine Trend Strategy
 * @Actor AI Engine
 * @Subsystem Trend Intelligence Suite
 * @References MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#UC070
 */
@Injectable()
export class TrendStrategizerService {
  // Implementation...
}
```

---

### Principle 2: API Documentation as Contract

**API documentation drives development — code adapts to spec, not the other way around.**

#### Implementation Rules:
1. **Spec First**: Update API documentation BEFORE writing code
2. **1:1 Mapping**: Every documented endpoint MUST exist in code
3. **Schema Match**: Request/Response DTOs must match documented schemas exactly
4. **Status Codes**: All documented status codes must be implemented

#### Enforcement:
```typescript
/**
 * POST /marketing/campaigns/:id/analyze-trends
 *
 * @APIDoc MARKETING_ENGINE_API_DOCUMENTATION.md#post-marketingcampaignsidanalyze-trends
 * @UseCase UC062 - Analyze Trends (Trigger Trend Collector)
 * @Returns 202 Accepted with jobId
 */
@Post(':id/analyze-trends')
async analyzeTrends(@Param('id') id: string) {
  // Implementation matches documented contract
}
```

---

### Principle 3: Naming Consistency Across Layers

**Maintain identical naming conventions from diagram → code → database → UI.**

#### Naming Pattern Enforcement:

| Layer | Pattern | Example |
|-------|---------|---------|
| **Use Case** | UC### - Descriptive Name | UC070 - Determine Trend Strategy |
| **NestJS Service** | [Name]Service | TrendStrategizerService |
| **NestJS Controller** | [Domain]Controller | TrendsController |
| **API Endpoint** | /marketing/[domain]/[action] | POST /marketing/trends/strategize |
| **Database Table** | snake_case plural | trend_strategies |
| **Frontend Hook** | use[Domain][Action] | useTrendStrategize() |
| **Type/Interface** | Pascal Case | TrendStrategy |
| **DTO** | [Name][Operation]Dto | TrendStrategyResponseDto |

#### Example Full-Stack Alignment:
```
Use Case:     UC070 - Determine Trend Strategy
Service:      TrendStrategizerService
Controller:   TrendsController
Endpoint:     POST /marketing/trends/strategize
Database:     trend_strategies table
Frontend:     useTrendStrategize() hook
Type:         TrendStrategy interface
DTO:          TrendStrategyRequestDto
```

---

## 🛡️ Implementation Guardrails

### Before Starting Any Phase

**Always reference the relevant use case subsystems:**

```markdown
## Phase X Implementation Checklist

- [ ] Identified use case subsystem: _____________
- [ ] Reviewed actors and interactions
- [ ] Verified all endpoints documented in API spec
- [ ] Confirmed naming conventions match diagram
- [ ] Added @UseCase decorators to all services
- [ ] Updated both documents if extending functionality
```

### Mandatory Pre-Implementation Review

Before writing code for ANY feature:

1. **Locate the Use Case**: Find it in `MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md`
2. **Review the Flow**: Understand actor interactions and sequence
3. **Check API Spec**: Verify endpoint is documented in `MARKETING_ENGINE_API_DOCUMENTATION.md`
4. **Validate Naming**: Ensure consistent naming across all layers
5. **Update Docs First**: If extending, update documentation BEFORE coding

---

## 🔍 Consistency Validation

### Automated Validation Script

**File**: `scripts/validate-architecture.ts`

Run before every commit:

```bash
npm run validate:architecture
```

**Checks performed**:
1. All API endpoints in code exist in documentation
2. All DTOs match documented schemas
3. All services have @UseCase decorators
4. Naming conventions are consistent
5. No undocumented endpoints exist

### Manual Validation Checklist

**Before each pull request**:

- [ ] All new endpoints added to API documentation
- [ ] All new use cases added to UML diagram
- [ ] Service classes annotated with @UseCase references
- [ ] Naming matches pattern across all layers
- [ ] Integration tests reference use case ID
- [ ] Frontend hooks follow naming convention

---

## 📋 Use Case Reference System

### Code Annotation Standard

All services MUST include use case references:

```typescript
/**
 * Trend Collector Service
 *
 * @UseCase UC070 - Determine Trend Strategy
 * @UseCase UC071 - Fetch Live Trends (Multi-platform)
 * @UseCase UC077 - Analyze Trend Relevance
 *
 * @Subsystem Trend Intelligence Suite
 * @Actor AI Engine
 *
 * @References MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#trend-intelligence-suite
 * @APIDoc MARKETING_ENGINE_API_DOCUMENTATION.md#trend-intelligence-apis
 */
@Injectable()
export class TrendCollectorService {
  /**
   * @UseCase UC071 - Fetch Live Trends
   * @APIEndpoint POST /marketing/trends/collect
   */
  async collectTrends(params: TrendCollectionParams): Promise<TrendData[]> {
    // Implementation
  }
}
```

### Controller Annotation Standard

```typescript
/**
 * Trends Controller
 *
 * @Subsystem Trend Intelligence Suite
 * @APIDoc MARKETING_ENGINE_API_DOCUMENTATION.md#trend-intelligence-apis
 */
@Controller('marketing/trends')
@ApiTags('trends')
export class TrendsController {

  /**
   * Collect live trends from multiple platforms
   *
   * @UseCase UC071 - Fetch Live Trends (Multi-platform)
   * @APIDoc MARKETING_ENGINE_API_DOCUMENTATION.md#post-marketingtrendscollect
   *
   * @returns 202 Accepted with jobId
   */
  @Post('collect')
  @HttpCode(202)
  async collectTrends(@Body() dto: TrendCollectionDto) {
    // Implementation matches API spec
  }
}
```

---

## 📊 Subsystem-to-Code Mapping

### Mandatory 1:1 Mapping

| Diagram Subsystem | Code Directory | Controller | Database Schema |
|-------------------|----------------|------------|-----------------|
| Authentication & Account System | `auth/`, `users/` | AuthController | users, user_sessions |
| Business Profile Manager | `marketing/profile/` | ProfileController | marketing_profiles |
| Platform Connector | `marketing/profile/services/platform-connection` | ProfileController (connections routes) | platform_connections |
| Campaign Creator | `marketing/campaigns/` | CampaignsController | campaigns, campaign_orders |
| Trend Intelligence Suite | `marketing/trends/` | TrendsController | trend_data |
| SEO Reactor | `marketing/seo/` | MarketingController (SEO routes) | keywords, serp_results |
| Campaign Orchestrator | `marketing/orchestration/` | MarketingController (orchestration routes) | campaign_content |
| Publishing Engine | `marketing/publishing/` | MarketingController (publishing routes) | published_content |
| Campaign Manager Dashboard | `marketing/campaigns/` | CampaignsController | campaigns (status management) |
| Analytics & Ads Manager | `marketing/analytics/` | MarketingController (analytics routes) | campaign_metrics |
| Optimizer & Feedback Loop | `marketing/optimization/` | OptimizationController | ab_tests, attribution_data |
| Content Creation Studio | `marketing/content/` | MarketingController (content routes) | blog_posts, content_assets |
| Video Studio | `marketing/video/` | VideoController | video_dna, video_assets |
| Link Building Engine | `marketing/link-building/` | MarketingController (link routes) | backlinks, outreach_campaigns |
| Intelligence Dashboard | `marketing/intelligence/` | IntelligenceController | narrative_content, forecasts |
| ML Lab | `marketing/ml/` | MLController | ml_predictions, ml_models |
| Workflows | `marketing/workflows/` | WorkflowsController | workflow_runs |
| System Monitoring | `marketing/monitoring/` | MonitoringController | system_metrics, health_checks |

---

## 🔄 Change Propagation Protocol

### When Updating Use Case Diagram

1. **Version the document**: Rename to `MARKETING_ENGINE_UML_USE_CASE_DIAGRAM_v2.md`
2. **Add changelog section** at top:
   ```markdown
   ## Version 2.0 Changes (2025-11-05)
   - Added UC400-410: A/B Testing workflow to Optimizer subsystem
   - Extended UC070: Trend Strategy now includes sentiment analysis
   - Deprecated UC099: Meta Tag optimization (replaced by UC098)
   ```
3. **Update API Documentation** to match new use cases
4. **Run validation script** to identify affected code
5. **Update code** to implement new use cases
6. **Update tests** to cover new use cases

### When Updating API Documentation

1. **Version the document**: Add version header
2. **Document all changes**:
   ```markdown
   ### API v2.1 Changes (2025-11-05)
   - Added: POST /marketing/ab-testing/create
   - Modified: POST /marketing/trends/analyze (added sentiment field)
   - Deprecated: GET /marketing/seo/meta-tags (use /marketing/seo/optimize instead)
   ```
3. **Update OpenAPI spec** in NestJS
4. **Regenerate API client**: `npm run generate` in `packages/api-client`
5. **Update frontend** to use new client types
6. **Add migration guide** for breaking changes

---

## 🚫 Prohibited Practices

### ❌ NEVER Do This:

1. **Create endpoints without documentation**
   ```typescript
   // ❌ BAD - Undocumented endpoint
   @Post('secret-feature')
   secretFeature() { ... }
   ```

2. **Introduce features without use cases**
   ```typescript
   // ❌ BAD - No corresponding use case in diagram
   @Injectable()
   export class MysteryService { ... }
   ```

3. **Use inconsistent naming**
   ```typescript
   // ❌ BAD - Naming doesn't match diagram
   // Diagram says "TrendCollector", code says "TrendGatherer"
   export class TrendGathererService { ... }
   ```

4. **Skip @UseCase decorators**
   ```typescript
   // ❌ BAD - No use case reference
   @Injectable()
   export class ImportantService { ... }
   ```

5. **Modify API contracts without updating docs**
   ```typescript
   // ❌ BAD - Changed response structure without updating API doc
   return { data: results, newField: 'surprise!' };
   ```

### ✅ ALWAYS Do This:

1. **Document THEN code**
   ```markdown
   1. Add use case to UML diagram
   2. Document endpoint in API doc
   3. Write code that implements both
   ```

2. **Annotate with use case references**
   ```typescript
   /**
    * @UseCase UC071 - Fetch Live Trends
    * @APIDoc MARKETING_ENGINE_API_DOCUMENTATION.md#post-marketingtrendscollect
    */
   @Injectable()
   export class TrendCollectorService { ... }
   ```

3. **Follow naming conventions exactly**
   ```
   Diagram: "Trend Collector"
   Service: TrendCollectorService ✅
   Controller: TrendsController ✅
   Endpoint: /marketing/trends/collect ✅
   Hook: useTrendCollector() ✅
   ```

4. **Update both documents when extending**
   ```bash
   # When adding new feature:
   1. Update MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md
   2. Update MARKETING_ENGINE_API_DOCUMENTATION.md
   3. Regenerate API client
   4. Implement in code
   ```

5. **Version control architectural changes**
   ```bash
   git commit -m "feat(architecture): Add A/B Testing use cases UC400-410

   - Updated UML diagram v2.0
   - Updated API doc v2.1
   - Added 10 new endpoints for A/B testing
   - Regenerated API client with new types

   Use Cases: UC400-UC410
   API Routes: POST /marketing/ab-testing/*"
   ```

---

## 🔬 Validation Scripts

### Architecture Consistency Validator

**File**: `scripts/validate-architecture.ts`

```typescript
/**
 * Validates architectural consistency between:
 * - Use Case Diagram
 * - API Documentation
 * - Actual Code Implementation
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export async function validateArchitecture(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validate all controllers have documented endpoints
  const controllers = findControllers();
  for (const controller of controllers) {
    const endpoints = extractEndpoints(controller);
    for (const endpoint of endpoints) {
      if (!isDocumented(endpoint)) {
        errors.push(`Undocumented endpoint: ${endpoint.method} ${endpoint.path} in ${controller.file}`);
      }
    }
  }

  // 2. Validate all services have @UseCase decorators
  const services = findServices();
  for (const service of services) {
    if (!hasUseCaseDecorator(service)) {
      warnings.push(`Service missing @UseCase decorator: ${service.file}`);
    }
  }

  // 3. Validate naming conventions
  const namingIssues = validateNamingConventions();
  errors.push(...namingIssues);

  // 4. Validate DTOs match API spec
  const dtoIssues = validateDTOs();
  errors.push(...dtoIssues);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Helper functions (to be implemented)
function findControllers(): any[] { /* ... */ }
function extractEndpoints(controller: any): any[] { /* ... */ }
function isDocumented(endpoint: any): boolean { /* ... */ }
function findServices(): any[] { /* ... */ }
function hasUseCaseDecorator(service: any): boolean { /* ... */ }
function validateNamingConventions(): string[] { /* ... */ }
function validateDTOs(): string[] { /* ... */ }
```

**Usage**:
```bash
npm run validate:architecture
```

**Output**:
```
🔍 Validating DryJets Architecture...

✅ All endpoints documented: 337/337
⚠️  3 services missing @UseCase decorators:
    - apps/api/src/modules/legacy/old.service.ts
    - apps/api/src/modules/deprecated/temp.service.ts
❌ 2 naming convention violations:
    - TrendGatherer should be TrendCollector
    - SEOHelper should be SEOReactor

❌ Validation FAILED
   Errors: 2
   Warnings: 3
```

---

## 📝 Git Commit Message Convention

### Use Case-Driven Commits

All commits implementing use cases MUST reference them:

```bash
# Feature commits
git commit -m "feat(trends): Implement UC071 - Fetch Live Trends

- Added TrendCollectorService
- Created POST /marketing/trends/collect endpoint
- Updated API documentation with new endpoint
- Added integration tests

Use Case: UC071
API Doc: MARKETING_ENGINE_API_DOCUMENTATION.md#L1234"

# Bug fixes
git commit -m "fix(campaigns): UC062 - Fix trend analysis timeout

- Increased timeout from 30s to 60s
- Added retry logic for failed API calls

Use Case: UC062
Issue: #456"

# Documentation updates
git commit -m "docs(architecture): Update UML diagram v2.0

- Added A/B Testing subsystem (UC400-410)
- Deprecated legacy endpoints
- Updated API documentation to match

Version: 2.0
Breaking: No"
```

---

## 🎓 Developer Onboarding

### New Developer Checklist

Before writing any code, developers MUST:

- [ ] Read `ARCHITECTURAL_GOVERNANCE.md` (this document)
- [ ] Review `MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md`
- [ ] Review `MARKETING_ENGINE_API_DOCUMENTATION.md`
- [ ] Understand the subsystem they're working in
- [ ] Locate the relevant use cases
- [ ] Verify API endpoints are documented
- [ ] Follow naming conventions exactly
- [ ] Add @UseCase decorators to all new code
- [ ] Run `npm run validate:architecture` before commits
- [ ] Update documentation when adding features

### Training Resources

1. **Architecture Overview**: Read all three North Star documents
2. **Code Examples**: Review existing well-documented services
3. **Validation**: Practice with validation script
4. **Naming Guide**: Memorize naming pattern table
5. **Git Conventions**: Review commit message examples

---

## 🔧 Pre-Commit Hook

**File**: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running architecture validation..."

npm run validate:architecture

if [ $? -ne 0 ]; then
  echo "❌ Architecture validation failed!"
  echo "Fix errors before committing or use --no-verify to skip (not recommended)"
  exit 1
fi

echo "✅ Architecture validation passed!"
```

**Install Husky**:
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run validate:architecture"
```

---

## 📊 Metrics & Monitoring

### Architecture Health Metrics

Track these metrics in CI/CD:

1. **Documentation Coverage**: % of endpoints documented
2. **Use Case Coverage**: % of code with @UseCase decorators
3. **Naming Compliance**: % of files following naming conventions
4. **Schema Drift**: Number of DTOs not matching API spec
5. **Undocumented Endpoints**: Count of endpoints missing from docs

**Target**:
- Documentation Coverage: 100%
- Use Case Coverage: 95%+
- Naming Compliance: 100%
- Schema Drift: 0
- Undocumented Endpoints: 0

---

## 🚀 Phase-Specific Guidance

### Phase 2: Type Safety
**Focus**: Ensure all DTOs match documented API schemas

**Checklist**:
- [ ] All DTOs have corresponding entries in API doc
- [ ] Request/response types match exactly
- [ ] Validation decorators match documented constraints
- [ ] Error responses match documented status codes

### Phase 3: Infrastructure
**Focus**: Shareable configs maintain naming conventions

**Checklist**:
- [ ] ESLint rules enforce naming patterns
- [ ] TypeScript paths use consistent aliases
- [ ] Build outputs match documented structure

### Phase 4: Integration
**Focus**: Frontend uses only documented endpoints

**Checklist**:
- [ ] All API calls use generated client
- [ ] No manual endpoint strings in code
- [ ] Hooks follow naming convention
- [ ] Types imported from @dryjets/api-client

---

## 🎯 Success Criteria

The DryJets architecture is **governable** when:

✅ **Every endpoint has documentation**
✅ **Every service has use case reference**
✅ **Naming is consistent across all layers**
✅ **Code validates against spec automatically**
✅ **Developers update docs before code**
✅ **CI/CD blocks non-compliant commits**
✅ **Architectural drift is detected early**

---

## 📞 Questions & Support

### When in Doubt:

1. **Check the diagram**: Does a use case exist?
2. **Check the API doc**: Is the endpoint documented?
3. **Check naming table**: Am I following conventions?
4. **Run validation**: Does my code pass checks?
5. **Ask for review**: Tag @architecture-team

### Exemptions

To request an exemption from these rules:

1. Document the reason in an ADR (Architecture Decision Record)
2. Get approval from tech lead
3. Add exemption comment in code:
   ```typescript
   // @ArchitectureExemption ADR-042: Legacy compatibility
   // This service predates use case system
   ```

---

## 📚 Related Documents

- [MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md](./MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md) - System behaviors
- [MARKETING_ENGINE_API_DOCUMENTATION.md](./MARKETING_ENGINE_API_DOCUMENTATION.md) - System interfaces
- [MONOREPO_REFACTORING_SUMMARY.md](./MONOREPO_REFACTORING_SUMMARY.md) - Implementation guide

---

## 📝 Changelog

### Version 1.0 (2025-10-29)
- ✅ Established North Star principle
- ✅ Defined use case traceability requirements
- ✅ Created naming convention standards
- ✅ Documented validation procedures
- ✅ Added commit message conventions
- ✅ Created developer onboarding checklist

---

**Effective Date**: 2025-10-29
**Mandatory Compliance**: All code merged after this date
**Review Cycle**: Quarterly
**Next Review**: 2026-01-29

---

**Engineering Law**: *"No feature exists in code unless it exists in the diagram or documentation."*

**Maintained By**: DryJets Architecture Team
**Status**: ✅ Active and Enforced
