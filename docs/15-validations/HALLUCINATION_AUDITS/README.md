# Hallucination Audit Reports

## Purpose

This directory stores AI hallucination audit reports generated during the development process. Each audit validates AI-generated code, documentation, and data against the canonical [TRUTH_MAP.yaml](../../14-marketing-engine/TRUTH_MAP.yaml).

## Report Format

Each audit report follows this structure:

```markdown
# Hallucination Audit — [Module Name]

**Date**: YYYY-MM-DD
**Auditor**: AI Agent / Human Reviewer
**Module**: [Module path or feature name]
**Lines Analyzed**: X

## Summary

**Total Hallucinations Found**: Y
**Confidence Score**: Z% (0-100)

## Findings

### Category 1: Database Models

**Fields Invented**: [list]
- Model.fieldName (line N) - NOT FOUND in schema.prisma
- ...

**Models Hallucinated**: [list]
- NonExistentModel (line N) - Does not exist

### Category 2: API Endpoints

**APIs Unverifiable**: [list]
- POST /api/marketing/fake-endpoint (line N) - NOT DOCUMENTED
- ...

### Category 3: Enum Values

**Invalid Enum Values**: [list]
- CampaignStatus.INVALID_STATUS (line N) - Not in enum definition
- ...

### Category 4: External APIs

**Unverified External Integrations**: [list]
- FakeAPI.com (line N) - Not in external_apis list
- ...

### Category 5: Services

**Service References Not Found**: [list]
- NonExistentService (line N) - Service does not exist
- ...

## Recommended Fixes

1. [Fix description for hallucination 1]
2. [Fix description for hallucination 2]
3. ...

## Verification Status

- [ ] All fixes applied
- [ ] Re-validated against TRUTH_MAP.yaml
- [ ] Tests pass
- [ ] Code review completed

## Conclusion

[Brief conclusion about the audit findings and remediation status]

---

**Audit Version**: 1.0.0
**TRUTH_MAP Version**: [version used for validation]
```

## Audit Workflow

### 1. Generation Phase

When generating code, the AI should:
- Reference TRUTH_MAP.yaml for all entities
- Validate all model names, fields, endpoints
- Check enum values against defined lists
- Verify service and platform names

### 2. Self-Audit Phase

After generation, run automatic validation:

```bash
# Validate against TRUTH_MAP
npm run validate:truth-map

# Run AI validation tests
npm test -- tests/ai-validation
```

### 3. Report Generation

Create audit report:

```bash
# Generate audit report for a module
npm run audit:generate -- --module="offer-lab/phase-1"
```

### 4. Review & Remediation

- Review findings
- Apply recommended fixes
- Re-run validation
- Mark audit as complete

## Audit Types

### Type 1: Full Module Audit

Comprehensive audit of an entire feature/module:
- All files in the module
- All models, APIs, services referenced
- All external integrations
- Complete validation test suite

File naming: `YYYY-MM-DD_full-audit_[module-name].md`

### Type 2: Incremental Audit

Audit of specific files or changes:
- Changed files only
- Focused validation
- Quick turnaround

File naming: `YYYY-MM-DD_incremental_[feature-name].md`

### Type 3: Pre-Commit Audit

Automated audit before committing:
- Git diff validation
- Schema compliance check
- Endpoint verification
- Enum validation

File naming: `YYYY-MM-DD_pre-commit_[branch-name].md`

## Hallucination Categories

### Critical (Blocks Deployment)

- Invented database models
- Non-existent API endpoints
- Invalid enum values
- Missing service dependencies

### High (Requires Fix)

- Unverified external APIs
- Undocumented model fields
- Missing service implementations
- Incorrect data types

### Medium (Should Fix)

- Inconsistent naming conventions
- Missing JSDoc comments
- Incomplete error handling
- Performance concerns

### Low (Nice to Have)

- Code style issues
- Documentation improvements
- Optimization opportunities

## Tools & Scripts

### Validation Scripts

Located in `/scripts`:
- `validate-truth-map.ts` - Validate TRUTH_MAP against codebase
- `generate-audit.ts` - Generate hallucination audit report
- `check-hallucinations.ts` - Quick hallucination check

### Test Suite

Located in `/tests/ai-validation`:
- `schema.validation.test.ts` - Schema compliance tests
- `endpoint.validation.test.ts` - API endpoint validation
- `enum.validation.test.ts` - Enum value validation
- `service.validation.test.ts` - Service reference validation

## Metrics

Track hallucination metrics over time:

| Metric | Target | Current |
|--------|--------|---------|
| Hallucinations per 1000 LOC | < 1 | TBD |
| Critical Hallucinations | 0 | TBD |
| Audit Pass Rate | > 95% | TBD |
| Confidence Score | > 90% | TBD |

## Best Practices

### For AI Agents

1. **Always reference TRUTH_MAP first** before generating code
2. **Cross-validate** all entities (models, endpoints, services)
3. **Run self-audit** after generation
4. **Generate audit report** for each significant change
5. **Never invent** models, endpoints, or services

### For Human Reviewers

1. **Review audit reports** for all AI-generated code
2. **Verify critical findings** manually
3. **Update TRUTH_MAP** when schema changes
4. **Maintain audit history** for tracking
5. **Enforce zero-critical-hallucination policy**

## Contributing

When adding new features:

1. Update TRUTH_MAP.yaml first
2. Generate code referencing TRUTH_MAP
3. Run validation tests
4. Generate audit report
5. Review and fix findings
6. Commit with clean audit

## Support

For questions or issues with the hallucination audit system:

1. Check [TRUTH_MAP.yaml](../../14-marketing-engine/TRUTH_MAP.yaml) for canonical definitions
2. Review [Anti-Hallucination Protocol](../../CLAUDE_CODE_PROMPT_TEMPLATE.md)
3. Run validation tests: `npm test -- tests/ai-validation`
4. Create issue with audit report attached

---

**Last Updated**: 2025-10-31
**Maintained By**: AI Anti-Hallucination Protocol Team
**Version**: 1.0.0
