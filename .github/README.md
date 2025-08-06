# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated testing, security checks, and releases.

## Workflows Overview

### 🔄 CI (`ci.yml`)
**Triggers:** Push to `main`/`develop`, Pull Requests

**What it does:**
- Tests on Node.js 18.x, 20.x, 21.x
- Runs type checking and linting
- Executes all test suites including critical API format tests
- Uploads test coverage reports
- Performs security audits

**Critical Tests:**
- `test:api-format` - Validates ElevenLabs API request format (prevents 403 errors)
- `test:unit` - Unit test coverage
- `test:integration` - Integration test coverage

### 🔍 Pull Request (`pr.yml`)
**Triggers:** Pull Request events

**What it does:**
- Quick validation of critical functionality
- Focuses on API format tests to prevent regressions
- Comments on PR with test results
- Tests Node.js compatibility
- Validates CLI functionality

### 🚀 Release (`release.yml`)
**Triggers:** Git tags starting with `v*` (e.g., `v1.2.0`)

**What it does:**
- Runs complete test suite before release
- Validates API format to ensure ElevenLabs integration works
- Creates GitHub release with changelog
- Optionally publishes to NPM (currently commented out)

**To create a release:**
```bash
git tag v1.2.0
git push origin v1.2.0
```

### 🛡️ Dependency Update Check (`dependency-update.yml`)
**Triggers:** Weekly (Mondays 9 AM UTC), Manual dispatch

**What it does:**
- Checks for security vulnerabilities
- Tests with updated dependencies
- Creates issues if problems found
- Validates that API format tests still pass after updates

## Important Test Requirements

All workflows prioritize the **API format tests** because they prevent critical integration issues:

- **ElevenLabs 403 errors** - Caused by incorrect request headers
- **API compatibility** - Ensures requests match expected format
- **Regression prevention** - Catches when someone adds problematic code

### Test Commands Used
```bash
npm run test:api-format    # Critical API format validation
npm run test:unit         # Unit tests
npm run test:integration  # Integration tests  
npm run typecheck         # TypeScript validation
npm run lint             # Code style checks
```

## Secrets Configuration

The workflows may use these GitHub secrets:

- `CODECOV_TOKEN` - For coverage reports (optional)
- `NPM_TOKEN` - For NPM publishing (when enabled)
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

## Workflow Files

| File | Purpose | Frequency |
|------|---------|-----------|
| `ci.yml` | Main CI/CD pipeline | Every push/PR |
| `pr.yml` | PR-specific validation | Every PR |
| `release.yml` | Release automation | On version tags |
| `dependency-update.yml` | Security maintenance | Weekly |

## Adding New Tests

When adding new tests, consider:

1. **Add to `ci.yml`** if it should run on every change
2. **Add to `pr.yml`** if it's critical for PR validation  
3. **Update `test:api-format`** if it relates to API request format
4. **Document in this README** if it prevents specific issues

## Troubleshooting

### Common Issues

1. **API format tests failing**: Someone may have modified the ElevenLabs request format
   - Check `tests/unit/elevenlabs-api-format.test.ts`
   - Verify no problematic headers were added

2. **Security audit failures**: Dependencies have vulnerabilities
   - Run `npm audit fix`
   - Check the created GitHub issue for details

3. **Node.js compatibility issues**: Code uses newer features
   - Check the matrix build results
   - Update minimum Node.js version if needed