# AI-Powered Test Case Generator

[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)

> Replace `OWNER/REPO` above with your GitHub account and repository name after pushing the project.

A web application that turns a plain-English software requirement into structured QA test cases, lets you run and track them, and exports them to CSV. Built as a portfolio project for an AI QA internship.

## Problem statement

Writing test cases by hand is slow, and it is easy to forget negative, boundary or edge cases. This project shows how AI can *assist* a tester: Claude drafts a first set of test cases from a requirement, and the tester reviews, edits, executes and tracks them. The AI is a helper, not a replacement for the tester.

## Features

- Generate test cases from a requirement (Positive, Negative, Boundary, Edge Case, Input Validation).
- Every test case has: ID, Scenario, Description, Preconditions, Steps, Test Data, Expected Result, Priority, Type, Execution Status.
- Claude API integration through the backend (API key never reaches the browser).
- JSON validation of every response before display; invalid items are skipped, unusable responses show an error (no fake results).
- Clearly labelled **demo mode** (predefined, rule-based cases) when no API key is set.
- Mark cases as Pass / Fail / Blocked / Not Run; edit; delete.
- Search by ID or scenario; filter by priority and status; export the visible cases to CSV.
- Dashboard: totals, progress bar, status distribution, breakdown by priority and type.
- Three one-click samples: User Login, Shopping Cart, User Registration.
- Data is kept in the browser's localStorage so a refresh does not lose your work.
- Export visible cases as CSV, Playwright starter code, Gherkin/BDD, or a portable JSON test suite.
- Import a validated JSON suite, create Markdown bug reports for failed cases, and link tests to requirement points.
- Review a simple test-suite quality score for coverage, duplicates, test data, and expected-result detail.
- Playwright E2E, API, and accessibility tests plus a GitHub Actions CI workflow.
- A real, deterministic Login Application Under Test in the Automation Lab, with five dedicated Playwright UI tests.
- Persistent Test Runs with execution snapshots, actual-result notes, failed-test image evidence, and Markdown reports.

## Technology stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, JavaScript, plain CSS |
| Backend | Node.js (18+), Express, dotenv, cors |
| AI | Claude Messages API (called with Node's built-in `fetch`) |
| Tests | Node's built-in test runner (`node --test`) |

## System architecture

```
Browser (React)  --/api/generate-->  Express server  --HTTPS-->  Claude API
     |                                   |   (API key lives here only)
     |                                   v
     |                         validate.js (checks JSON)
     |<------ validated test cases ------+
     v
localStorage (saved work)
```

```
ai-powered-test-case-generator/
  client/                 React + Vite frontend
    src/
      App.jsx             page switching, state, localStorage
      api.js              talks to the backend
      samples.js          3 sample requirements
      components/         Sidebar, Dashboard, Generator, Manage, EditModal, Badges
      utils/testCases.js  pure functions: stats, filter, status update, CSV
    tests/                frontend logic tests
  server/
    src/
      index.js            starts the server, reads .env
      app.js              Express routes + error handling
      claude.js           prompt + Claude API call + JSON extraction
      validate.js         validation and normalisation of test cases
      demo.js             predefined / rule-based demo cases
    tests/                validation, demo and API tests
  README.md
  INTERVIEW_GUIDE.md
  e2e/                    Playwright browser, API, and accessibility tests
  .github/workflows/ci.yml GitHub Actions unit and E2E pipeline
```

## How it works

1. The user types (or loads) a requirement and clicks Generate.
2. The frontend checks it is not empty and sends it to `POST /api/generate`.
3. The backend validates it again. With an API key it sends a prompt to Claude asking for JSON only; without a key (or if demo is ticked) it uses `demo.js`.
4. The reply is parsed and validated by `validate.js`: required fields, allowed priorities and types. IDs (`TC-001`...) and the status `Not Run` are assigned by the server.
5. The frontend shows the cases with a badge: **AI-generated** or **DEMO result - not AI-generated**.
6. The user executes tests (changes status), edits, deletes, filters, and exports CSV. The dashboard updates automatically.

If Claude fails (bad key, rate limit, timeout, invalid JSON) the user sees an error message. Demo results are **never** substituted silently.

## Installation

Requirements: Node.js 18 or newer.

```bash
cd ai-powered-test-case-generator
cd server && npm install
cd ../client && npm install
```

## Environment variables

```bash
cd server
cp .env.example .env      # Windows: copy .env.example .env
```

| Variable | Meaning |
|---|---|
| `ANTHROPIC_API_KEY` | Your Claude API key. Leave empty for demo mode. |
| `CLAUDE_MODEL` | Model name (default `claude-sonnet-5-5`). |
| `PORT` | Backend port (default 5000). |

Never commit `.env` (it is already in `.gitignore`).

## Running the app

Open two terminals.

```bash
# Terminal 1 - backend
cd server
npm start            # http://localhost:5000

# Terminal 2 - frontend
cd client
npm run dev          # http://localhost:5173
```

Open http://localhost:5173. The sidebar shows **Demo mode** or **Claude AI mode**.

## Running the tests

```bash
cd server && npm test
cd client && npm test
```

Run browser tests after installing Chromium once:

```bash
cd e2e
npm install
npx playwright install chromium
npm test
npm run report
```

The root shortcuts are `npm run test:server`, `npm run test:client`, `npm run test:e2e`, and `npm run test:all`.

## New QA workflow features

- **Automation exports:** download filtered cases as a safe Playwright starter script or a Gherkin `.feature` file. Generated Playwright tests are intentionally marked `fixme` until real selectors and actions are added.
- **Quality score:** 40 points for all five test types, 20 for no near-duplicate scenarios, 20 for concrete test data, and 20 for specific expected results. This is a simple review heuristic, not a guarantee of quality.
- **Bug reports:** failed cases can become structured Markdown reports with priority, severity, environment, reproduction steps, and actual result.
- **Traceability:** requirement sentences become R1, R2, and so on. Link each case manually or use the keyword suggestion, then review uncovered requirements in the traceability matrix.
- **Suite portability:** export/import JSON test suites. Imports are validated for format, required fields, allowed values, steps, and unique IDs before replacing any current suite.
- **Automation Lab:** a working local login feature demonstrates genuine UI automation—not just generated templates. Its Playwright suite verifies positive login, required fields, invalid email, wrong credentials, and password-length boundary handling.
- **Test Runs:** snapshot the current suite for a named execution run, mark outcomes without changing the source suite, add actual results and small image evidence, then export a Markdown execution report.

## Screenshots / demo GIF

Add project screenshots or a short demo GIF under `docs/` when ready. Useful captures: Dashboard quality card, Manage exports, bug report modal, and Traceability matrix.

Covered: empty requirement validation, test case generation (demo and AI path with a fake Claude), invalid AI responses, API error mapping, status updates, search and filtering, CSV export (quoting and formula protection).

## Screenshots

Add your own screenshots after running the app (save them in a `screenshots/` folder):

- `screenshots/dashboard.png` - Dashboard
- `screenshots/generate.png` - Generate page
- `screenshots/manage.png` - Manage page with filters

## Known limitations

- AI output can be wrong or repetitive; a human must review it.
- Test cases are stored only in the browser (no database, no user accounts).
- One requirement at a time; generating again replaces the current set.
- Demo mode recognises only login, cart and registration keywords; other requirements get a generic set.
- No automatic test execution: statuses are set by hand.
- Component (UI) tests are not included; tests cover the logic and the API.
- The quality score and auto-linking use simple heuristics and require human review.
- Exported Playwright code is a documented starting point, not a ready-to-run test of an unknown target website.
- The Automation Lab is deliberately local and deterministic. It is a portfolio AUT, not a production authentication service.
- Run history and evidence are held in browser localStorage; image evidence is deliberately limited to 900 KB per attachment.

## Future improvements

- Database storage and multiple projects.
- Import requirements from a file or Jira.
- Export to Excel/PDF and to automation code (Selenium/Playwright).
- Test run history and reports.
- Configurable quality rules, richer traceability links, and direct issue-tracker integration.
- Rate limiting and authentication on the backend.
- UI component tests with Vitest and React Testing Library.
