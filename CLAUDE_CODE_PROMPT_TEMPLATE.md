# Claude Code Prompt Template

**Use this template at the start of EVERY development phase**

This ensures Claude Code always references the North Star documents and maintains architectural consistency.

---

## 🎯 Standard Phase Prompt Template

Copy and paste this template when starting any new development phase:

```markdown
## Phase [X]: [Phase Name]

**Before proceeding with any implementation**:

Cross-reference all changes with:
1. **Use Case Diagram**: MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md
2. **API Documentation**: MARKETING_ENGINE_API_DOCUMENTATION.md

**Mandatory Requirements**:
- Ensure endpoint structures, naming, and logic flows match the defined system behaviors
- Do not introduce new modules, routes, or terminology without explicitly updating both documents
- Add @UseCase decorators to all services and controllers
- Follow naming conventions exactly as defined in ARCHITECTURAL_GOVERNANCE.md
- Run `npm run validate:architecture` before marking phase complete

---

### Phase Objectives

[Describe what you want to achieve in this phase]

Example:
- Implement UC070-085: Trend Intelligence Suite
- Create TrendCollectorService, TrendAnalyzerService, TrendPredictorService
- Add endpoints: POST /marketing/trends/collect, GET /marketing/trends/active
- Wire to frontend with generated API client

---

### Relevant Use Cases

List the specific use cases from the diagram:

- UC070 - Determine Trend Strategy
- UC071 - Fetch Live Trends (Multi-platform)
- UC072 - Collect Google Trends Data
- UC073 - Collect Twitter Trends
- UC074 - Collect Reddit Weak Signals
- UC077 - Analyze Trend Relevance
- UC078 - Score Trend Virality

---

### Relevant API Endpoints

List the endpoints from the API documentation:

- POST /marketing/trends/collect - Collect live trends from multiple platforms
- GET /marketing/trends - Get current trending topics
- POST /marketing/trends/predict - Predict future trend growth
- GET /marketing/trends/opportunities - Get urgent trend opportunities

---

### Subsystem Focus

Which subsystem from the UML diagram?

- **Subsystem**: Trend Intelligence Suite
- **Actors**: User, AI Engine, Trend Data APIs
- **Related Subsystems**: SEO Reactor, Campaign Orchestrator

---

### Implementation Checklist

Before starting:
- [ ] Reviewed use cases UC070-085 in UML diagram
- [ ] Verified endpoints are documented in API spec
- [ ] Confirmed naming conventions match (TrendCollector, not TrendGatherer)
- [ ] Identified database models needed (trend_data table)
- [ ] Planned service structure (TrendCollectorService, etc.)

During implementation:
- [ ] Added @UseCase decorators to all new services
- [ ] Added @APIDoc references to all controllers
- [ ] Followed naming conventions exactly
- [ ] Created DTOs matching documented schemas
- [ ] Implemented error responses matching API spec

After implementation:
- [ ] Run `npm run validate:architecture`
- [ ] Update API documentation if extended
- [ ] Update UML diagram if new use cases added
- [ ] Write integration tests referencing use cases
- [ ] Document any architectural decisions

---

### Success Criteria

This phase is complete when:
- [ ] All use cases implemented with proper annotations
- [ ] All endpoints match API documentation exactly
- [ ] Validation script passes with no errors
- [ ] Frontend can use generated API client
- [ ] Tests cover all documented behaviors
- [ ] Documentation updated if extended

---

Please proceed with implementation following these guidelines.
```

---

## 📋 Example Prompts for Common Phases

### Phase 2: Type Safety
```markdown
## Phase 2: Type Safety Enhancement

Cross-reference with:
- MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md
- MARKETING_ENGINE_API_DOCUMENTATION.md

**Objectives**:
- Enable strict TypeScript in apps/api
- Fix all type errors
- Export DTOs from packages/types
- Ensure all types match documented API schemas

**Requirements**:
- All DTOs must match API documentation request/response schemas
- All services must have @UseCase decorators
- Re-enable disabled modules (drivers, payments, notifications)
- Validation script must pass

**Validation**:
Before completion, run:
```bash
npm run type-check
npm run validate:architecture
```

Ensure:
- Zero TypeScript errors
- All endpoints documented
- All services annotated
```

---

### Phase 3: Trend Intelligence Suite
```markdown
## Phase 3: Implement Trend Intelligence Suite

Cross-reference with:
- MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#trend-intelligence-suite
- MARKETING_ENGINE_API_DOCUMENTATION.md#trend-intelligence-apis

**Use Cases to Implement**:
- UC070 - Determine Trend Strategy
- UC071 - Fetch Live Trends
- UC072-076 - Platform-specific trend collection
- UC077-085 - Trend analysis and prediction

**API Endpoints**:
- POST /marketing/trends/collect
- GET /marketing/trends
- GET /marketing/trends/active
- POST /marketing/trends/predict
- GET /marketing/trends/opportunities

**Services to Create**:
```
apps/api/src/modules/marketing/trends/
├── trend-collector.service.ts    # UC071
├── trend-analyzer.service.ts     # UC077
├── trend-predictor.service.ts    # UC079
└── trends.controller.ts
```

**Naming Conventions**:
- Service: TrendCollectorService (not TrendGatherer)
- Controller: TrendsController
- Endpoint: /marketing/trends/collect
- Table: trend_data
- Frontend hook: useTrendCollect()

**Validation**:
```bash
npm run validate:architecture
```

Must show:
- All endpoints documented
- All services have @UseCase UC070-085
- Zero naming violations
```

---

### Phase 4: Frontend Integration
```markdown
## Phase 4: Wire Frontend to API Client

Cross-reference with:
- MARKETING_ENGINE_API_DOCUMENTATION.md
- packages/api-client/README.md

**Objectives**:
- Replace all manual axios calls with @dryjets/api-client
- Ensure all API calls use documented endpoints only
- Create React Query hooks for common operations
- Remove internal tRPC (not connected to backend)

**Requirements**:
- Import client from `@dryjets/api-client`
- Import types from `@dryjets/api-client`
- Follow naming convention: useTrendCollect(), not useFetchTrends()
- All calls must reference documented endpoints

**Example Migration**:
```typescript
// ❌ Before (manual)
const response = await axios.post('/trends', data);

// ✅ After (generated client)
import { client } from '@dryjets/api-client';
import type { TrendData } from '@dryjets/api-client';

const response = await client.post<TrendData[]>('/marketing/trends/collect', data);
```

**Validation**:
```bash
npm run validate:architecture
```

Ensure:
- No undocumented endpoints called
- All types imported from @dryjets/api-client
- Frontend hooks follow naming conventions
```

---

## 🎨 Customization Guide

### For New Subsystems
1. Identify the subsystem in UML diagram
2. List all use cases (UC###)
3. List all API endpoints
4. Define service structure
5. Specify naming conventions
6. Add validation criteria

### For Bug Fixes
```markdown
## Bug Fix: [Issue Description]

**Related Use Case**: UC### - [Use Case Name]
**Related Endpoint**: [METHOD] /path/to/endpoint

**Issue**:
[Describe the bug]

**Root Cause**:
[What's wrong]

**Fix**:
[What you're changing]

**Validation**:
- [ ] Bug is fixed
- [ ] Use case behavior still correct
- [ ] API contract unchanged (or updated in docs)
- [ ] Tests updated
- [ ] `npm run validate:architecture` passes

**Cross-Reference**:
- Use Case: MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#UC###
- API Doc: MARKETING_ENGINE_API_DOCUMENTATION.md#endpoint-name
```

### For New Features
```markdown
## New Feature: [Feature Name]

**⚠️ DOCUMENTATION FIRST**:
Before implementing, update:
1. MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md - Add UC### for new use case
2. MARKETING_ENGINE_API_DOCUMENTATION.md - Document new endpoints

**New Use Cases**:
- UC### - [New Use Case Name]
- UC### - [Another New Use Case]

**New Endpoints**:
- POST /marketing/[domain]/[action] - [Description]
- GET /marketing/[domain]/[resource] - [Description]

**Implementation**:
- Create [Name]Service with @UseCase UC###
- Create [Domain]Controller
- Follow naming conventions
- Match documented schemas exactly

**Validation**:
- [ ] Use cases added to diagram
- [ ] Endpoints added to API doc
- [ ] Implementation matches both
- [ ] `npm run validate:architecture` passes
- [ ] Both documents versioned (v2.x)
```

---

## 🚨 Emergency Template (When Things Break)

```markdown
## URGENT: [Issue]

**Stop and verify**:
- [ ] Did I check the use case diagram first?
- [ ] Did I check the API documentation?
- [ ] Is my code following architectural governance?

**Issue**:
[What broke]

**Cause**:
[Why it broke]

**Impact**:
- Use Cases Affected: UC###, UC###
- Endpoints Affected: [LIST]

**Fix Plan**:
1. Revert breaking change
2. Update documentation if needed
3. Implement fix following governance
4. Run validation
5. Test thoroughly

**Validation**:
```bash
npm run validate:architecture
npm run type-check
npm run test
```

**Cross-Reference**:
Before fixing, review:
- ARCHITECTURAL_GOVERNANCE.md
- MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md
- MARKETING_ENGINE_API_DOCUMENTATION.md
```

---

## 📝 Quick Snippet Library

### Paste at start of any prompt:
```markdown
**Architectural Governance Reminder**:
Cross-reference with MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md and MARKETING_ENGINE_API_DOCUMENTATION.md. Ensure endpoint structures, naming, and logic flows match defined system behaviors. Do not introduce new modules without updating both documents.
```

### For service creation:
```markdown
**Service Requirements**:
- Add @UseCase decorator referencing UC###
- Follow naming: [Name]Service
- Match API documentation schemas
- Include architectural references in JSDoc
```

### For endpoint creation:
```markdown
**Endpoint Requirements**:
- Must be documented in MARKETING_ENGINE_API_DOCUMENTATION.md
- Add @UseCase and @APIDoc decorators
- Match documented request/response types
- Use correct HTTP method and status codes
```

### Before finishing:
```markdown
**Pre-Completion Validation**:
```bash
npm run validate:architecture
npm run type-check
```

Ensure:
- [ ] All endpoints documented
- [ ] All services annotated
- [ ] Naming conventions followed
- [ ] Both documents updated if extended
```

---

## 🎯 Phase-Specific Templates

### Database Changes
```markdown
## Database Schema Changes

**Related Use Cases**: UC###, UC###

**Before changing schema**:
1. Check if models are documented in API doc
2. Update Prisma schema with proper naming (snake_case tables)
3. Generate migration
4. Update @dryjets/types to export new types
5. Update API documentation with new fields

**Validation**:
- [ ] Schema matches use case requirements
- [ ] API doc updated with new fields
- [ ] Types exported from packages/types
- [ ] Migration runs successfully
```

### AI Service Implementation
```markdown
## AI Service: [Service Name]

**Use Case**: UC### - [Name]
**Actor**: AI Engine
**Subsystem**: [Subsystem Name]

**Service Must**:
- Have @UseCase decorator
- Be in `apps/api/src/modules/marketing/[subsystem]/`
- Follow naming: [Name]Service
- Use Claude AI client properly
- Handle errors matching API doc

**Claude Integration**:
- Model: claude-3-5-sonnet (complex) or claude-3-5-haiku (simple)
- Streaming: [Yes/No]
- Caching: [Yes/No]

**Validation**:
- [ ] Service annotated with UC###
- [ ] API endpoint documented
- [ ] Error handling matches spec
```

---

## 💡 Best Practices

### ✅ DO use this template:
- At the start of every phase
- When adding new features
- When fixing bugs affecting use cases
- Before major refactoring

### ✅ DO customize:
- Add specific use cases
- List exact endpoints
- Specify files to create
- Define success criteria

### ❌ DON'T skip:
- Cross-referencing both documents
- Adding @UseCase decorators
- Running validation
- Updating documentation

---

## 📊 Template Effectiveness

Your prompt is effective when:
- ✅ References specific use cases (UC###)
- ✅ Lists exact endpoints
- ✅ Specifies naming conventions
- ✅ Includes validation steps
- ✅ Has clear success criteria

Your prompt needs improvement when:
- ❌ No use case references
- ❌ Vague endpoint descriptions
- ❌ No validation criteria
- ❌ Missing architectural governance reminder

---

## 🎓 Learning to Write Good Prompts

### Beginner Template (Week 1)
Just copy the standard template and fill in use cases

### Intermediate Template (Week 2-3)
Customize with specific services, endpoints, naming

### Advanced Template (Week 4+)
Create phase-specific templates, add validation criteria, define success metrics

---

## 🔗 Quick Links

- [Architectural Governance](./ARCHITECTURAL_GOVERNANCE.md) - Full rules
- [Use Case Diagram](./MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md) - System behaviors
- [API Documentation](./MARKETING_ENGINE_API_DOCUMENTATION.md) - API contracts
- [Developer Quick Reference](./DEVELOPER_QUICK_REFERENCE.md) - Cheat sheet
- [Validation Script](./scripts/validate-architecture.ts) - Code validator

---

**Remember**: Every Claude Code session should start with this template!

**The Rule**: No code without referencing the North Star documents.

---

**Template Version**: 1.0
**Last Updated**: 2025-10-29
**Usage**: Mandatory for all development phases
