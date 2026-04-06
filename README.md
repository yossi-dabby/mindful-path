# Base44 App

## Required Environment Variables

The following environment variables **must** be set for the app to work correctly.

| Variable | Where to set | Description |
|---|---|---|
| `VITE_BASE44_APP_ID` | `.env` (local), GitHub Actions secret (CI) | Base44 application identifier. Without this, all API calls will target `/api/apps/undefined/...` and return 404. |

### Setting up for CI (GitHub Actions)

1. Go to your repository: **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `VITE_BASE44_APP_ID`
4. Value: your Base44 application ID
5. Click **Add secret**

The Playwright E2E workflow will fail at the "Validate required secrets" step with a clear error message if this secret is missing.

### Setting up for local development

Copy the example env file and fill in your values:

```bash
cp env.staging.example .env
# Then edit .env and set VITE_BASE44_APP_ID=<your-app-id>
```

## Running E2E Tests

### Smoke Tests (Production-critical, Read-only)

Quick smoke tests verify critical functionality without modifying data. Perfect for pre-deployment validation:

```bash
npm run test:e2e -- --project=smoke-production-critical
```

**📖 [Full Smoke Test Documentation](SMOKE.md)**

### Full E2E Test Suite

To run all E2E tests (including smoke, web-desktop, and mobile):

```bash
npm ci
npx playwright install --with-deps
npm run test:e2e
```

### Local Setup and Execution

To run E2E tests locally, execute the following commands:

```bash
npm ci
npx playwright install --with-deps
npm run test:e2e
```

### BASE_URL Behavior

The E2E tests use the `BASE_URL` environment variable to determine which server to test against (configured in `playwright.config.ts`):

- **If `BASE_URL` is set:** Playwright runs tests against the specified URL
- **If `BASE_URL` is not set:** Playwright automatically builds the app and starts the Vite preview server at `http://127.0.0.1:4173`

#### Running Against a Custom URL

**Mac/Linux:**
```bash
BASE_URL=http://localhost:5173 npm run test:e2e
```

**PowerShell:**
```powershell
$env:BASE_URL="http://localhost:5173"; npm run test:e2e
```

### Troubleshooting

If tests fail:
- **In CI:** Download the `playwright-report` artifact from GitHub Actions to view the HTML report
- **Locally:** Run tests with the `--ui` flag to debug interactively:
  ```bash
  npm run test:e2e -- --ui
  ```
