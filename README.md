# WeMoove E2E Test Framework

End-to-end test automation for FurnMovers (WeMoove-Web) — `https://www.furnmovers.com`

**Stack:** Playwright · TypeScript · Cucumber BDD · Allure Reports

---

## Prerequisites

- Node.js 20+
- npm 9+
- Allure CLI (`npm install -g allure-commandline` or Homebrew: `brew install allure`)

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
# Fill in .env with real credentials
```

## Running Tests

```bash
# All tests
npm test

# Smoke suite only (fast, ~5 min)
npm run test:smoke

# By domain
npm run test:auth
npm run test:delivery

# Parallel (4 workers)
npm run test:parallel

# CI mode (no @skip tags, 2 workers)
npm run test:ci
```

## Allure Reports

```bash
# After a test run, generate and open the report
npm run report:generate
npm run report:open

# Or serve live (auto-refreshes)
npm run report:serve
```

The report auto-deploys to GitHub Pages on merge to `main`.

---

## Project Structure

```
src/
├── api/                    # API client + domain-specific API classes
│   ├── api-client.ts       # Axios wrapper with auth injection
│   ├── auth.api.ts
│   ├── delivery.api.ts
│   └── fixture-factory.ts  # Test data creation & cleanup
│
├── features/               # Gherkin feature files
│   ├── auth/
│   ├── delivery/
│   ├── evidence/
│   ├── disputes/
│   └── public/
│
├── pages/                  # Page Object Model
│   ├── base.page.ts        # Shared helpers
│   ├── auth/
│   ├── courier/
│   └── public/
│
├── step-definitions/       # Cucumber step implementations
│   ├── auth/
│   ├── common/             # Shared navigation steps
│   ├── delivery/
│   ├── disputes/
│   ├── evidence/
│   └── public/
│
├── support/
│   ├── env.ts              # Typed environment config
│   ├── world.ts            # Cucumber World (Playwright bridge)
│   ├── hooks.ts            # Before/After/role hooks
│   └── allure-helper.ts    # Allure labels, steps, attachments
│
└── utils/
    ├── faker-helpers.ts    # SA-specific data generators
    └── test-data/
        ├── users.ts
        └── deliveries.ts
```

---

## Test Design Principles

### API-Seeded Test Data
Each scenario creates its own data via API in `Background` or `Given` steps using `FixtureFactory`. After the scenario, all created deliveries are automatically deleted in `teardown()`.

This ensures:
- No dependency on shared state between scenarios
- Scenarios can run in any order or in parallel
- Clean environment after every run

### Page Object Model
All UI interaction goes through Page Objects in `src/pages/`. Step definitions never contain raw selectors — they call POM methods. This isolates selector changes to a single file.

### Role-Based Authentication
Tag your scenario with a role hook instead of writing login steps:
```gherkin
@as-courier-admin
Scenario: Create a delivery
  # already logged in as courier admin
```

Available role tags: `@as-courier-admin`, `@as-dispatcher`, `@as-driver`, `@as-sender`

### Allure Integration
- **Suites:** `@auth`, `@delivery`, `@evidence`, `@dispute`, `@public`, `@smoke`, `@regression`
- **Severity:** `@critical`, `@major`, `@normal`, `@minor`, `@trivial`
- **Jira links:** `@jira:FM-123` → links to ticket in report
- Steps are wrapped in `AllureHelper.step()` for granular reporting
- On failure: screenshot + HTML snapshot + trace attached automatically

---

## Environment Variables

See `.env.example` for all variables. Key ones:

| Variable | Description |
|---|---|
| `BASE_URL` | App URL (default: `https://www.furnmovers.com`) |
| `API_BASE_URL` | API base URL |
| `BROWSER` | `chromium` / `firefox` / `webkit` |
| `HEADLESS` | `true` / `false` |
| `SCREENSHOT_ON_FAILURE` | Attach screenshot when step fails |
| `VIDEO_ON_FAILURE` | Record video for failed scenarios |
| `TRACE_ON_FAILURE` | Capture Playwright trace on failure |
| `COURIER_ADMIN_EMAIL` | Test courier admin credentials |

---

## CI/CD

GitHub Actions workflow at `.github/workflows/e2e.yml`:

- **On PR:** Smoke suite runs automatically (~5 min)
- **On merge to main/develop:** Full parallel regression (2 shards)
- **Nightly (02:00 SAST):** Full regression run
- **Manual trigger:** Choose tags + environment in GitHub UI

Required GitHub secrets: `BASE_URL`, `API_BASE_URL`, `COURIER_ADMIN_EMAIL`, `COURIER_ADMIN_PASSWORD`, `DISPATCHER_EMAIL`, `DISPATCHER_PASSWORD`, `DRIVER_EMAIL`, `DRIVER_PASSWORD`, `SENDER_EMAIL`, `SENDER_PASSWORD`

---

## Adding New Tests

1. Write a `.feature` file in `src/features/<domain>/`
2. Tag it with suite + severity tags
3. Implement any new steps in `src/step-definitions/<domain>/`
4. Add any new page interactions to a POM in `src/pages/<domain>/`
5. API-seed data via `FixtureFactory` — never depend on pre-existing data
