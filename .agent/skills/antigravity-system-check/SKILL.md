---
name: antigravity-system-check
description: Comprehensive system health check for Multi Store Saas project including dependencies, tests, database, and environment validation
---

# Antigravity System Check

## Purpose
Perform thorough system validation to ensure the Multi Store Saas project is properly configured, all dependencies are valid, tests pass, and the development environment is ready for productive work.

## When to Use
Use this skill when:
- Starting a new development session to verify system state
- After installing new dependencies or making environment changes
- Before deploying to production
- When experiencing unexplained errors or issues
- After pulling changes from git that may affect configuration

## Instructions

### Phase 1: Environment Configuration Check

Verify project configuration files are present and valid:

1. Check root directory contains required configuration files:
   - `package.json` (dependencies and scripts)
   - `wrangler.toml` (Cloudflare Pages configuration)
   - `drizzle.config.ts` (database ORM configuration)
   - `vite.config.ts` (build configuration)
   - `tsconfig.json` (TypeScript configuration)

2. Validate environment files exist:
   - Check for `.env` file in root directory
   - Verify `.dev.vars` exists for local development
   - Confirm `.env.example` is available for reference

3. Read and validate critical environment variables:
   - Extract Cloudflare account ID and API key
   - Verify D1 database binding configuration
   - Check R2 storage credentials
   - Validate any required API endpoints

### Phase 2: Dependency Validation

Ensure all project dependencies are properly installed and compatible:

1. Run dependency installation check:
   ```bash
   npm install
   ```

2. Check for security vulnerabilities:
   ```bash
   npm audit
   ```

3. Verify lock file consistency:
   ```bash
   npm ci
   ```

4. Validate critical dependencies:
   - Remix framework: `@remix-run/*`
   - ORM: `drizzle-orm`
   - Cloudflare: `@cloudflare/workers-types`, `wrangler`
   - Testing: `vitest`, `@playwright/test`

### Phase 3: Database Configuration Check

Verify database schema and migrations are properly configured:

1. Check database configuration:
   - Read `drizzle.config.ts` file
   - Verify D1 database connection string
   - Validate schema output directory exists

2. Verify migration files exist:
   - Check `db/migrations/` directory
   - Confirm presence of schema migrations:
     - `0001_initial_schema.sql`
     - `0002_seed_data.sql`
     - `0003_hybrid_mode.sql`

3. Validate database schema:
   ```bash
   npm run db:generate
   ```

4. For local development, verify database is accessible:
   ```bash
   wrangler d1 info multi-store-saas-db --local
   ```

### Phase 4: Build System Check

Ensure the build system is properly configured:

1. Verify TypeScript configuration:
   ```bash
   npm run typecheck
   ```

2. Check for linting errors:
   ```bash
   npm run lint
   ```

3. Test build process:
   ```bash
   npm run build
   ```

4. Verify build output:
   - Confirm `build/` directory was created
   - Check for client and server build artifacts
   - Validate asset generation

### Phase 5: Testing Validation

Run all test suites to ensure code quality:

1. Run unit tests:
   ```bash
   npm run test
   ```

2. Check test coverage:
   ```bash
   npm run test:coverage
   ```

3. Run E2E tests with UI:
   ```bash
   npm run e2e:ui
   ```

4. Verify all tests pass with no critical failures

### Phase 6: Cloudflare Integration Check

Validate Cloudflare Workers and Pages configuration:

1. Check `wrangler.toml` configuration:
   - Validate project name: `multi-store-saas`
   - Verify D1 database binding: `DB`
   - Confirm R2 bucket binding: `R2`

2. Test Cloudflare authentication:
   ```bash
   wrangler whoami
   ```

3. Verify remote database access:
   ```bash
   wrangler d1 info multi-store-saas-db
   ```

4. Check Pages project configuration:
   - Verify project name matches deployment target
   - Confirm production branch settings

### Phase 7: Application Health Check

Start development server and verify application loads:

1. Start local development server:
   ```bash
   npm run dev:wrangler
   ```

2. Monitor startup logs for:
   - Server successful startup message
   - Database connection established
   - No critical errors or warnings
   - All routes registered successfully

3. Verify critical endpoints:
   - Check homepage loads: `http://localhost:8788`
   - Test authentication flow
   - Verify database operations work
   - Check API endpoints respond

### Phase 8: Report Generation

Compile system check results into a structured report:

1. Create report with the following sections:
   - **Environment Status**: ✓/✗ configuration files found
   - **Dependencies**: ✓/✗ installed and secure
   - **Database**: ✓/✗ configured and accessible
   - **Build System**: ✓/✗ typecheck, lint, build pass
   - **Tests**: ✓/✗ unit and E2E test results
   - **Cloudflare**: ✓/✗ authenticated and configured
   - **Application**: ✓/✗ server starts and responds

2. Document any issues found with:
   - File paths where errors occur
   - Specific error messages
   - Recommended fixes
   - Priority level (critical/high/low)

3. Provide summary and next steps:
   - If all checks pass: System is ready for development
   - If failures found: List required fixes before proceeding

## Troubleshooting Common Issues

### Missing Environment Variables
Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Edit `.env` with actual values for your Cloudflare account.

### Database Connection Failures
- Verify `wrangler.toml` has correct D1 binding
- Check database name matches in config
- Ensure Cloudflare authentication is valid
- Try: `wrangler d1 execute multi-store-saas-db --local --command="SELECT 1"`

### Build Errors
- Clear node_modules: `rm -rf node_modules`
- Reinstall dependencies: `npm install`
- Check TypeScript version compatibility
- Verify all imports are correct

### Test Failures
- Ensure all test dependencies are installed
- Check test database is properly seeded
- Verify test fixtures are up to date
- Run tests in verbose mode for debugging: `npm run test -- --reporter=verbose`

### Cloudflare Authentication Issues
- Login to Cloudflare: `wrangler login`
- Verify API token has correct permissions
- Check project exists in Cloudflare dashboard
- Ensure account ID in configuration is correct

## Exit Conditions

This skill is complete when:
1. All eight phases have been executed
2. System check report has been generated
3. All issues found have been documented with recommended fixes
4. User has clear understanding of system health status
