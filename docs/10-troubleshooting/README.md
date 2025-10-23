# Troubleshooting & Fixes

This directory contains detailed documentation of issues encountered during development and their solutions.

## 📂 Issue Categories

### Build & Configuration Issues

- **[CACHE_ISSUE_RESOLVED.md](./CACHE_ISSUE_RESOLVED.md)** - Cache-related build problems
- **[METRO_CONFIG_SOLUTION.md](./METRO_CONFIG_SOLUTION.md)** - React Native Metro bundler fixes
- **[MONOREPO_FIX_COMPLETE.md](./MONOREPO_FIX_COMPLETE.md)** - Monorepo structure fixes
- **[MONOREPO_STRUCTURAL_REPAIR_REPORT.md](./MONOREPO_STRUCTURAL_REPAIR_REPORT.md)** - Complete structural repair

### Mobile App Issues

- **[EXPO_GO_COMPATIBILITY_FIX.md](./EXPO_GO_COMPATIBILITY_FIX.md)** - Expo Go compatibility
- **[NATIVE_MODULE_FIX_COMPLETE.md](./NATIVE_MODULE_FIX_COMPLETE.md)** - Native module linking
- **[MONOREPO_NATIVE_MODULE_ISSUE.md](./MONOREPO_NATIVE_MODULE_ISSUE.md)** - Monorepo + Native modules

### JavaScript Engine Issues

- **[HERMES_FIX_GUIDE.md](./HERMES_FIX_GUIDE.md)** - Hermes engine compatibility guide
- **[HERMES_COMPATIBILITY_SCAN.md](./HERMES_COMPATIBILITY_SCAN.md)** - Scan results for Hermes
- **[HERMES_COMPATIBILITY_INDEX.md](./HERMES_COMPATIBILITY_INDEX.md)** - Hermes issue index
- **[HERMES_SCAN_SUMMARY.md](./HERMES_SCAN_SUMMARY.md)** - Quick scan summary
- **[README_HERMES_SCAN.md](./README_HERMES_SCAN.md)** - Hermes scanning README

### General Fixes

- **[ROOT_CAUSE_ANALYSIS_AND_FIX.md](./ROOT_CAUSE_ANALYSIS_AND_FIX.md)** - Deep dive into root causes
- **[SIMPLE_SOLUTION_COMPLETE.md](./SIMPLE_SOLUTION_COMPLETE.md)** - Simple solution approaches
- **[FINAL_FIX_COMPLETE.md](./FINAL_FIX_COMPLETE.md)** - Final comprehensive fixes

## 🔍 How to Use This Section

### When You Encounter an Error

1. **Search by keyword**: Use your IDE or `grep` to search for error messages
2. **Check recent fixes**: Start with `FINAL_FIX_COMPLETE.md` for latest solutions
3. **Component-specific**: Look for files matching your technology (Metro, Hermes, etc.)

### Common Issues Quick Reference

| Symptom | Document |
|---------|----------|
| Metro bundler errors | `METRO_CONFIG_SOLUTION.md` |
| Build cache issues | `CACHE_ISSUE_RESOLVED.md` |
| Native modules won't link | `NATIVE_MODULE_FIX_COMPLETE.md` |
| Hermes crashes | `HERMES_FIX_GUIDE.md` |
| Monorepo workspace issues | `MONOREPO_FIX_COMPLETE.md` |
| Expo Go compatibility | `EXPO_GO_COMPATIBILITY_FIX.md` |

## 🛠️ Prevention Tips

- Keep dependencies up to date
- Run `npm ci` instead of `npm install` for consistent builds
- Clear caches regularly: `npm run clean` or `npx expo start -c`
- Use `npx turbo` for efficient monorepo builds
- Test on real devices, not just simulators

## 📝 Contributing Fixes

Found and fixed a new issue? Please document it!

1. Create a new markdown file: `ISSUE_NAME_FIX.md`
2. Use this template:
   ```markdown
   # [Issue Title]

   ## Problem Description
   [What went wrong]

   ## Root Cause
   [Why it happened]

   ## Solution
   [Step-by-step fix]

   ## Prevention
   [How to avoid in future]

   ## Related Issues
   [Links to related docs]
   ```
3. Submit a PR with your documentation

## 🔗 Related Documentation

- **Setup Guides**: [docs/01-setup/](../01-setup/)
- **Architecture**: [docs/02-architecture/](../02-architecture/)
- **Progress Reports**: [docs/12-progress-reports/](../12-progress-reports/)

---

[← Back to Documentation Index](../README.md)
