# CI/CD Pipeline Documentation

## Overview

Complete automated CI/CD pipeline using GitHub Actions for continuous integration, testing, and deployment.

**Pipeline Status:** ✅ Ready for Production

---

## GitHub Actions Workflows

### 1. **Main CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branch
- Pull Request to `main` or `develop` branch

#### Jobs:

##### **Build and Test** (Runs on Node 20.x & 22.x)
```yaml
- Install dependencies
- Run TypeScript build
- Execute test suite
- Upload coverage reports
```

**Purpose:** Ensure code compiles and all tests pass across different Node versions

**Steps:**
1. Checkout code
2. Setup Node.js (with npm cache)
3. Install dependencies (`npm ci`)
4. Run build (`npm run build`)
5. Run tests (`npm test`)
6. Upload coverage (codecov)

---

##### **Lint & Type Check**
```yaml
- TypeScript strict mode validation
- Type checking without emit
```

**Purpose:** Catch type errors and ensure code quality

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Check TypeScript compilation

---

##### **Docker Build**
```yaml
- Build Docker image
- Validate Dockerfile
- Cache layers for faster builds
```

**Purpose:** Ensure application can be containerized

**Steps:**
1. Setup Docker Buildx
2. Build Docker image
3. Cache for future builds

---

##### **Security Scan**
```yaml
- Run npm audit
- Check for vulnerabilities
- Report security issues
```

**Purpose:** Identify security vulnerabilities early

**Steps:**
1. Install dependencies
2. Run npm audit (moderate level)
3. Log vulnerabilities

---

##### **Deploy** (Only on `main` branch)
```yaml
- Production build
- Archive artifacts
- Create deployment summary
```

**Purpose:** Prepare for production deployment

**Steps:**
1. Checkout code
2. Build for production
3. Upload dist/ artifacts (5-day retention)
4. Create GitHub step summary

---

### 2. **Code Quality Checks** (`.github/workflows/quality-checks.yml`)

**Triggers:**
- Push to `main` or `develop` branch
- Pull Request to `main` or `develop` branch

#### Jobs:

##### **Code Quality**
```yaml
- TypeScript type checking
- Run full test suite
- Generate coverage reports
```

**Steps:**
1. TypeScript build with --noEmit
2. Run tests (`npm test`)
3. Generate coverage (`npm test -- --coverage`)

---

##### **Security**
```yaml
- Dependabot metadata fetch
- Node.js audit
- Vulnerability scanning
```

**Steps:**
1. Fetch dependency metadata
2. Run npm audit
3. Report findings

---

##### **Build Check**
```yaml
- Production build validation
- Verify dist directory
- Confirm build artifacts
```

**Steps:**
1. Run production build
2. Verify dist/ exists
3. Log success/failure

---

## Pipeline Flow Diagram

```
┌─────────────────────┐
│  Push/Pull Request  │
└──────────┬──────────┘
           │
           ├─────────────────────┬──────────────────┬──────────────┐
           │                     │                  │              │
           ▼                     ▼                  ▼              ▼
     ┌──────────┐        ┌────────────┐    ┌──────────┐    ┌─────────┐
     │ Build &  │        │   Lint &   │    │ Docker   │    │Security │
     │  Test    │        │ Type Check │    │  Build   │    │  Scan   │
     │(Node 20) │        │            │    │          │    │         │
     │(Node 22) │        │            │    │          │    │         │
     └────┬─────┘        └────┬───────┘    └────┬─────┘    └────┬────┘
          │                   │                 │              │
          └───────────────────┴─────────────────┴──────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  All Jobs Pass?  │
                    └────────┬─────────┘
                             │
               ┌─────────────┴─────────────┐
               │ (only if main branch)     │
               ▼                           ▼
        ┌─────────────┐           ┌───────────────┐
        │   Deploy    │           │   PR Review   │
        │  Production │           │   Required    │
        └─────────────┘           └───────────────┘
```

---

## Configuration Details

### Node Versions Tested
- Node 20.x (LTS)
- Node 22.x (Current)

### Cache Strategy
- npm dependencies cached based on `package-lock.json`
- GitHub Actions cache layer (docker builds)

### Security Audit Levels
- **Moderate**: Reports moderate and high vulnerabilities
- **Continue on Error**: Audit failures don't block pipeline

### Coverage Requirements
- Codecov integration for tracking
- HTML coverage reports generated
- Coverage reports stored in `coverage/` directory

---

## Environment Variables

### Required for CI/CD
```bash
GITHUB_TOKEN          # Auto-provided by GitHub
NODE_ENV              # Not set (defaults to development)
```

### For Deployment (Future)
```bash
DOCKER_REGISTRY       # Docker hub or private registry
DOCKER_USERNAME       # Docker authentication
DOCKER_PASSWORD       # Docker authentication
DEPLOY_URL            # Deployment endpoint
```

---

## Workflow Status & Artifacts

### View Pipeline Status
1. Go to Repository → Actions
2. Select workflow run
3. View job logs and status

### Access Artifacts
1. Click on workflow run
2. Scroll to "Artifacts" section
3. Download `production-build.zip`

### View Test Coverage
1. GitHub Actions → Quality Checks
2. View coverage reports in logs
3. Check coverage HTML in artifacts

---

## Failure Handling

### Build Failures
**If tests fail:**
- Pipeline stops at test job
- Notification sent to PR/commit author
- Merge blocked until fixed

**Resolution:**
```bash
npm run build      # Local build check
npm test           # Run tests locally
# Fix errors
git push           # Retry pipeline
```

### Type Check Failures
**If TypeScript errors:**
- Pipeline stops at lint job
- Check GitHub Actions logs for errors

**Resolution:**
```bash
npm run build -- --noEmit  # Check locally
# Fix type errors
git push                   # Retry
```

### Security Audit Failures
**If vulnerabilities found:**
- Pipeline reports but continues
- Check npm audit output
- Update dependencies if needed

**Resolution:**
```bash
npm audit fix              # Auto-fix
npm audit fix --force      # Force fix
npm install                # Install fixes
git push                   # Retry
```

---

## Best Practices

### 1. **Branch Protection Rules**
```yaml
- Require status checks to pass
- Require code reviews before merge
- Dismiss stale reviews on push
- Require branches up to date before merge
```

### 2. **Commit Messages**
```
Format: type(scope): description

Examples:
- feat(auth): add login endpoint
- fix(tests): update mock paths
- ci(workflow): add coverage reporting
```

### 3. **Pull Requests**
- Link to issues: `Closes #123`
- Describe changes clearly
- Wait for all checks to pass
- Request reviews from teammates

### 4. **Secrets Management**
```bash
# Never commit secrets
# Use GitHub Secrets for:
- API keys
- Database credentials
- Docker credentials
```

---

## Local Development Equivalents

### Replicate CI/CD Locally
```bash
# Install and build
npm ci
npm run build

# Run tests
npm test

# Check types
npm run build -- --noEmit

# Docker build
docker build -t node-ts-app .

# Security audit
npm audit
```

### Speed Up Development
```bash
# Use watch mode during development
npm run dev              # App with hot reload
npm run test:watch      # Tests with watch

# Only run tests that changed
npm test -- --changed
```

---

## Performance Metrics

| Component | Time |
|-----------|------|
| Install Dependencies | ~30s |
| TypeScript Build | ~15s |
| Run Tests (48 tests) | ~2s |
| Docker Build | ~45s |
| Total Pipeline | ~3-4 min |

---

## Monitoring & Alerts

### GitHub Status Checks
- ✅ `Build and Test (20.x)` - Status check
- ✅ `Build and Test (22.x)` - Status check
- ✅ `Lint` - Status check
- ✅ `Docker Build` - Status check
- ✅ `Code Quality` - Status check

### Email Notifications
- Failures sent to commit author
- Configured in GitHub user settings

### Slack Integration (Optional)
```yaml
- uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      text: Build ${{ job.status }}
```

---

## Troubleshooting

### Pipeline Stuck
```bash
# Rerun all jobs
# GitHub UI: Click "Re-run all jobs"

# Or via GitHub CLI
gh run rerun <run-id>
```

### Cache Issues
```bash
# Clear GitHub Actions cache
# GitHub UI: Settings → Actions → Clear cache

# Or continue with fresh install
# Pipeline will install fresh dependencies
```

### Node Version Mismatch
```bash
# Verify local Node version
node --version

# Should match package.json engines
# Update .nvmrc or use nvm
nvm use 22
```

---

## Future Enhancements

- [ ] Automatic version bumping
- [ ] Release notes generation
- [ ] Automatic GitHub releases
- [ ] Automated dependency updates (Dependabot)
- [ ] Performance benchmarking
- [ ] SonarQube code analysis
- [ ] Slack/email notifications
- [ ] Multi-region deployment

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vitest Testing](https://vitest.dev)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig)

---

**Last Updated:** January 22, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready
