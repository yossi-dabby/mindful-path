# Base44 App

## Running E2E Tests

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
