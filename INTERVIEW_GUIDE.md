# Interview Guide - AI-Powered Test Case Generator

Plain-language answers you can say out loud. Practise them with the live demo open.

## 1. What problem does this project solve?
Writing test cases takes time and people forget cases. My app takes a requirement and creates a first draft of test cases with AI. Then I (the tester) review, edit, run and track them. It saves time on the boring first draft but keeps the human in charge.

## 2. What is software QA?
Software Quality Assurance is making sure software works as expected and meets the requirements, by planning and testing it before users find problems. It is not only finding bugs; it is also preventing them with good processes.

## 3. What are test cases?
A test case is one specific check: a scenario, the steps, the data to use, and what should happen.
Example: *Login with a wrong password* - Steps: open login page, enter valid email, enter wrong password, click Login. Expected: error "Invalid email or password".
Each of mine has an ID, scenario, description, preconditions, steps, test data, expected result, priority, type and status.

## 4. Positive vs negative testing
- **Positive**: give valid input and check the system works. *Correct email + correct password -> logged in.*
- **Negative**: give invalid input and check the system handles it safely. *Correct email + wrong password -> error, not logged in.*
Both are needed: a system that only works for perfect input is not reliable.

## 5. What is boundary value testing?
Bugs often hide at the edges of allowed ranges. If a password must be 8-64 characters, test 7, 8, 9, 63, 64 and 65. In the cart sample: stock is 5, so test quantity 5 (allowed) and 6 (rejected).

## 6. What are edge cases?
Unusual but possible situations: email with spaces around it, double-clicking Submit, special characters like `<>&`, an empty cart at checkout, SQL-injection text in a field, refreshing the page mid-way.

## 7. How does the Claude API integration work?
- The React app never talks to Claude. It calls my Express backend at `/api/generate`.
- The backend reads `ANTHROPIC_API_KEY` from `.env` and sends a request to Claude's Messages API with a system prompt ("you are a QA engineer, reply with JSON only") and the requirement.
- The prompt describes the exact JSON shape I want.
- The key stays on the server, so users cannot steal it from the browser.
- If no key is set, the app uses demo mode and says so clearly.
- The requirement is wrapped in `<requirement>` tags and the prompt says to treat it as data, which reduces prompt-injection risk.

## 8. How is the JSON response validated?
`server/src/validate.js` does this for every response:
1. Extract the JSON (removing code fences if Claude added them) and parse it; if it fails, show an error.
2. Check there is a `testCases` array.
3. For each item check required fields (scenario, description, steps, expected result), a valid priority (High/Medium/Low) and a valid type (the five types).
4. Skip invalid items and count them; if none are valid, return an error.
5. The server (not the AI) assigns IDs and sets status to Not Run.
I tested this with good, partly bad and totally bad responses.

## 9. How would a manual tester use this app?
1. Paste the requirement and generate test cases.
2. Read them and edit or delete weak ones (the AI draft is a starting point).
3. Open the application under test and execute each case.
4. Set Pass / Fail / Blocked for each.
5. Check the dashboard for progress and failures.
6. Export CSV and share it or import it into another tool.

## 10. Limitations of AI-generated test cases
- May miss requirements that were not written down, or invent behaviour.
- Can be generic, repetitive or incorrect (wrong expected results).
- Does not know the real app, business rules or past bugs.
- Results can differ between runs.
So a tester must review everything. I also never show fake AI results when the API fails.

## 11. Future improvements
Database and user accounts, Excel/PDF export, test run history, importing from Jira, generating Selenium/Playwright scripts, UI tests with React Testing Library, rate limiting.

## Extra questions to be ready for
- **Why a backend?** To keep the API key secret and to validate data in one trusted place.
- **Why validate on the server?** AI output is untrusted input, like user input.
- **Why does CSV export add `'` before `=`?** To stop "CSV/formula injection" when a file is opened in Excel.
- **Why are the helper functions separate (`utils/testCases.js`)?** They are pure functions, so they are easy to test without a browser.
- **Where is data stored?** In the browser's localStorage only.

## Demo script (3 minutes)
1. Show the sidebar badge (Demo or Claude AI mode).
2. Generate page -> click "View demo cases" on User Login System.
3. Manage page -> expand a case, change a few statuses, edit one, delete one.
4. Search "empty", filter High priority, export CSV and open it.
5. Dashboard -> explain progress and charts.
6. Try an empty requirement to show validation.
7. Explain `validate.js` and the tests.
# Extended project talking points

## What is end-to-end testing?

End-to-end (E2E) testing checks the application like a real user: it opens the browser, clicks buttons, fills forms, and verifies visible outcomes. This project uses Playwright to test Demo mode, filters, status changes, editing, exports, reload persistence, the API, and accessibility. Unit tests check small pure functions; E2E tests check that the pieces work together.

## What real application did you automate?

The project includes an **Automation Lab** with a small Login Application Under Test (AUT). It has an actual login form and deterministic validation rules. Playwright tests use the email and password fields, click Sign in, and verify real page states. Five tests cover valid login, missing fields, invalid email format, wrong credentials, and a short-password boundary. This makes the project stronger than an exporter-only demo because it proves I can automate a user flow against a working feature.

## What is CI?

Continuous Integration (CI) automatically runs checks whenever code is pushed or a pull request is opened. The GitHub Actions pipeline first runs server and client unit tests, then installs Chromium and runs the Playwright suite. This catches regressions before code is merged.

## What is BDD/Gherkin?

BDD expresses expected behavior in readable form: **Given** a precondition, **When** a user action happens, **Then** an expected outcome should occur. The Gherkin export lets a tester share scenarios with technical and non-technical team members.

## How does the quality score work?

It awards up to 100 points: 40 for coverage of Positive, Negative, Boundary, Edge Case, and Input Validation tests; 20 if no similar scenario pairs are found; 20 based on concrete test data; and 20 based on detailed expected results. It is intentionally a simple heuristic: it helps reviewers notice gaps but never proves a suite is correct.

## How are bug reports structured?

A failed test case can create a Markdown report containing severity, priority, environment, preconditions, numbered reproduction steps, test data, expected result, actual result, and the linked test-case ID. The tester enters the actual result because the application must not invent evidence.

## What is requirement traceability?

Traceability connects each requirement point (R1, R2, etc.) to the test cases that verify it. The matrix shows execution counts and clearly highlights requirements with no tests. Keyword auto-linking is only a suggestion; a tester reviews it.

## What is a test run and why is it separate from a test case?

A test case is the reusable instruction for checking a feature. A test run is a time-specific execution record, for example “Login regression - build 1.0.” The Test Runs page snapshots the current cases, records Pass/Fail/Blocked results, actual observations, and small screenshot evidence. This separation is important because editing a reusable test case later should not rewrite historical execution evidence.

## Why validate imported suites?

Imported JSON is checked for the expected version, required fields, valid status/priority/type values, non-empty steps, and unique IDs. Validation prevents a damaged or unrelated file from corrupting the test suite or falsely claiming that results came from AI.

## Likely viva questions

**Why not let AI create bug reports automatically?** Actual results are evidence from execution, so a tester must supply them.

**Why do exported Playwright tests use `fixme`?** Requirements do not contain page selectors or a target application URL. The export is a safe starter template rather than a misleading runnable test.

**How is the Automation Lab different from exported Playwright code?** The lab has a real local UI and selectors, so its Playwright tests execute and assert actual behaviour. Exported code is a starter file for an external application whose selectors are not known yet.

**Why attach screenshots to failed results?** A screenshot gives developers and reviewers visible evidence of the observed failure. The application limits attachment size because browser localStorage is not meant to store large files.

**Does a high quality score mean the tests are perfect?** No. It measures simple completeness signals and supports, rather than replaces, human QA review.

