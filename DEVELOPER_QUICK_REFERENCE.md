# DryJets Developer Quick Reference

**For New Developers**: Start here before writing any code! 🚀

---

## 🧭 The North Star

Two documents define the entire system:

1. **[MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md](./MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md)** - WHAT the system does
2. **[MARKETING_ENGINE_API_DOCUMENTATION.md](./MARKETING_ENGINE_API_DOCUMENTATION.md)** - HOW it communicates

> **Golden Rule**: No code without documentation. Update docs FIRST, then code.

---

## 🎯 Before Writing Any Code

```bash
# 1. Find the use case
grep -i "trend collector" MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md

# 2. Check if endpoint is documented
grep -i "/marketing/trends" MARKETING_ENGINE_API_DOCUMENTATION.md

# 3. If not documented, ADD IT FIRST
# Edit API doc, then code

# 4. Run validation before commit
npm run validate:architecture
```

---

## 📝 Code Annotation Template

### For Services:
```typescript
/**
 * Trend Collector Service
 *
 * @UseCase UC070 - Determine Trend Strategy
 * @UseCase UC071 - Fetch Live Trends
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
  // Your code...
}
```

### For Controllers:
```typescript
/**
 * @UseCase UC071 - Fetch Live Trends
 * @APIDoc MARKETING_ENGINE_API_DOCUMENTATION.md#post-marketingtrendscollect
 * @returns 202 Accepted with jobId
 */
@Post('collect')
@HttpCode(202)
async collectTrends(@Body() dto: TrendCollectionDto) {
  // Implementation matches API spec exactly
}
```

---

## 🏷️ Naming Conventions (Mandatory!)

| Layer | Pattern | Example |
|-------|---------|---------|
| **Use Case** | UC### - Name | UC070 - Determine Trend Strategy |
| **Service** | [Name]Service | TrendCollectorService |
| **Controller** | [Domain]Controller | TrendsController |
| **Endpoint** | /marketing/[domain]/[action] | POST /marketing/trends/collect |
| **Database** | snake_case plural | trend_data |
| **Frontend** | use[Domain][Action] | useTrendCollect() |
| **Type** | PascalCase | TrendData |
| **DTO** | [Name][Op]Dto | TrendCollectionDto |

---

## ✅ Development Workflow

### 1. **Start Feature**
```bash
# Find use case in diagram
# UC071 - Fetch Live Trends

# Check API doc for endpoint
# POST /marketing/trends/collect - MUST exist!

# If not in API doc: ADD IT FIRST!
```

### 2. **Write Code**
```typescript
// apps/api/src/modules/marketing/trends/trend-collector.service.ts

/**
 * @UseCase UC071 - Fetch Live Trends
 * @Subsystem Trend Intelligence Suite
 */
@Injectable()
export class TrendCollectorService {
  /**
   * @UseCase UC071
   * @APIDoc MARKETING_ENGINE_API_DOCUMENTATION.md#L1234
   */
  async collectTrends() { ... }
}
```

### 3. **Validate**
```bash
npm run validate:architecture
```

### 4. **Commit**
```bash
git commit -m "feat(trends): Implement UC071 - Fetch Live Trends

- Added TrendCollectorService
- Created POST /marketing/trends/collect
- Updated API documentation

Use Case: UC071
API Doc: MARKETING_ENGINE_API_DOCUMENTATION.md#L1234"
```

---

## 🚫 Common Mistakes (Don't Do This!)

### ❌ Code without documentation
```typescript
// NO! Where's the @UseCase decorator?
@Injectable()
export class MyService { ... }
```

### ❌ Endpoint not in API doc
```typescript
// NO! This endpoint isn't documented!
@Post('mystery-endpoint')
mysteryFeature() { ... }
```

### ❌ Wrong naming
```typescript
// NO! Should end with "Service"
export class TrendHelper { ... }
```

### ❌ Undocumented API changes
```typescript
// NO! Changed response without updating docs!
return { data: results, surprise: 'new field!' };
```

---

## ✅ Correct Examples

### ✅ Properly documented service
```typescript
/**
 * @UseCase UC070 - Determine Trend Strategy
 * @Subsystem Trend Intelligence Suite
 * @Actor AI Engine
 */
@Injectable()
export class TrendStrategizerService { ... }
```

### ✅ Properly documented endpoint
```typescript
/**
 * @UseCase UC071 - Fetch Live Trends
 * @APIDoc MARKETING_ENGINE_API_DOCUMENTATION.md#post-marketingtrendscollect
 * @returns 202 Accepted { jobId: string }
 */
@Post('collect')
@HttpCode(202)
async collectTrends() { ... }
```

### ✅ Correct naming
```
TrendCollectorService ✅
TrendsController ✅
trend_data table ✅
useTrendCollect() hook ✅
```

---

## 🔍 Quick Commands

```bash
# Validate architecture
npm run validate:architecture

# Check if use case exists
grep "UC071" MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md

# Check if endpoint documented
grep "/marketing/trends/collect" MARKETING_ENGINE_API_DOCUMENTATION.md

# Find naming violations
npm run validate:architecture | grep "naming"

# See all use cases
cat MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md | grep "^#### UC"

# See all endpoints
cat MARKETING_ENGINE_API_DOCUMENTATION.md | grep "^###.*POST\|GET\|PUT\|DELETE"
```

---

## 📋 Pre-Commit Checklist

Before every commit:

- [ ] Use case exists in UML diagram OR I added it
- [ ] Endpoint documented in API doc OR I added it
- [ ] Service has @UseCase decorator
- [ ] Controller endpoint has @UseCase decorator
- [ ] Naming follows conventions
- [ ] `npm run validate:architecture` passes
- [ ] Commit message references use case

---

## 🎓 Learning Path

### Day 1: Read
1. [ARCHITECTURAL_GOVERNANCE.md](./ARCHITECTURAL_GOVERNANCE.md) (full rules)
2. [MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md](./MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md) (system behaviors)
3. [MARKETING_ENGINE_API_DOCUMENTATION.md](./MARKETING_ENGINE_API_DOCUMENTATION.md) (API contracts)

### Day 2: Explore
1. Find your subsystem in UML diagram
2. Find related endpoints in API doc
3. Review existing code in `apps/api/src/modules/`
4. Look for good examples with @UseCase decorators

### Day 3: Practice
1. Pick a small feature
2. Document it first (diagram + API doc)
3. Implement with proper annotations
4. Run validation
5. Get code review

---

## 🆘 When Stuck

### "I can't find the use case"
→ It might not exist yet! Create it in the diagram first.

### "The endpoint isn't documented"
→ Add it to API doc before implementing.

### "Validation is failing"
→ Read the error messages. They tell you exactly what's wrong.

### "Naming is confusing"
→ Check the naming table above. Follow it exactly.

### "I want to add a new feature"
→ Update UML diagram → Update API doc → Then code.

---

## 🔗 Key Files

| File | Purpose |
|------|---------|
| [ARCHITECTURAL_GOVERNANCE.md](./ARCHITECTURAL_GOVERNANCE.md) | Full governance rules |
| [MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md](./MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md) | System behaviors (120+ use cases) |
| [MARKETING_ENGINE_API_DOCUMENTATION.md](./MARKETING_ENGINE_API_DOCUMENTATION.md) | API contracts (337+ endpoints) |
| [MONOREPO_REFACTORING_SUMMARY.md](./MONOREPO_REFACTORING_SUMMARY.md) | Implementation progress |
| [scripts/validate-architecture.ts](./scripts/validate-architecture.ts) | Validation script |

---

## 📊 Validation Script Output

When you run `npm run validate:architecture`, you'll see:

```
🔍 DryJets Architecture Validation

1. Validating Controllers & Endpoints...
   Controllers: 12
   Endpoints: 337
   Documented: 320 (95.0%)

2. Validating Services...
   Services: 89
   With @UseCase: 67 (75.3%)

3. Validating Naming Conventions...
   ✓ All files follow naming conventions

4. Checking for Undocumented Endpoints...
   ⚠ Found 17 potentially undocumented endpoints

════════════════════════════════════════
  Validation Results
════════════════════════════════════════

⚠️  Warnings (17):
   ! Endpoint may be undocumented: POST /marketing/legacy/old-endpoint
   ...

✅ VALIDATION PASSED

🎯 Targets:
   Endpoint Documentation: 100% (current: 95.0%)
   Service Use Cases: 95% (current: 75.3%)
   Naming Violations: 0 ✓
```

---

## 💡 Pro Tips

1. **Always start with the diagram** - It shows you the big picture
2. **Document before coding** - Saves time in code review
3. **Use validation script** - Catches issues early
4. **Follow naming exactly** - Makes code self-documenting
5. **Reference use cases in commits** - Creates traceable history
6. **When extending system** - Update docs first, then code
7. **Ask questions early** - Better than wrong implementation

---

## 🎯 Success Metrics

Your code is production-ready when:

- ✅ Every endpoint is documented
- ✅ Every service has @UseCase
- ✅ Naming follows conventions 100%
- ✅ Validation passes with no errors
- ✅ Code reviews reference use cases
- ✅ Tests cover documented behaviors

---

## 📞 Get Help

1. **Read this guide** ← You are here!
2. **Check architectural governance** - Full detailed rules
3. **Review existing code** - Find good examples
4. **Run validation** - See what needs fixing
5. **Ask team** - We're here to help!

---

**Remember**: Documentation → Validation → Code → Review → Ship

**The Golden Rule**: *No code without documentation.*

---

**Version**: 1.0
**Last Updated**: 2025-10-29
**Next Review**: When you onboard
