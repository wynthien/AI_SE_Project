# Test Report - AI_SE_Project
Date: October 25, 2025
Branch: test
Framework: Jest 30.2.0 | Node.js 22.15.0
Prompt:
    - Please set up jest test environment for this project please, on branch test(not created)
    - What are the test cases used?
    - I added new test environment varibles in setup.js. Please test again and make test report
    - Why does coverage 63.63%? Please check and debug
    - What's the coverage currently?
    - Create a test log that writes all test results while running test again

## Summary
- Test Suites: 4 passed / 4 total
- Tests: 33 passed / 33 total
- Snapshots: 0
- Duration: ~54.5s (includes live API calls)
- Environment: Loaded from .env via tests/setup.js
  - GOOGLE_API_KEY: present
  - MONGO_URI: present
  - NODE_ENV: test

## Suites and Cases
- Integration: tests/integration/chat.routes.test.js
  - POST /api/chat – returns todo list response – PASS
  - POST /api/chat – handles missing message – PASS
  - POST /api/accept – accepts and saves todo – PASS
  - GET /api/todos – retrieves accepted todos – PASS

- Unit: tests/unit/parseTodoList.test.js
  - Parses I./II./III. sections – PASS
  - Handles bullet variants (*, -, [ ], [x]) – PASS
  - Vietnamese headers fallback – PASS
  - Edge cases: empty, null, no headers – PASS

- Unit: tests/unit/TodoList.model.test.js
  - Model defined and named – PASS
  - Valid document creation – PASS
  - Defaults (accepted=false, sessionId='', generatedAt) – PASS
  - Required fields validation – PASS
  - Multiple sections and structure validation – PASS

- Unit (env/live): tests/unit/chatController.test.js
  - Env variables loaded from .env – PASS
  - handleChat: 400 for missing message – PASS
  - handleChat: handles API failure (rate-limit) – PASS
  - chatBA: 400 for missing message – PASS
  - chatBA: processes valid user story (API may rate-limit) – PASS
  - acceptTodo: 400 for missing fields – PASS
  - acceptTodo: saves valid todo (model mocked) – PASS
  - acceptTodo: handles save errors – PASS
  - getAcceptedTodos: returns and handles errors – PASS
  - Google AI instantiation – PASS

Notes: The Google API sometimes returned HTTP 429 (rate limit). Tests are written to handle this gracefully and still pass by verifying error handling paths.

## Coverage (npm run test:coverage)
- Overall: Statements 82.35% | Branches 63.63% | Functions 85.71% | Lines 82.35%
- controllers/chatController.js: Statements 88.65% | Branches 65.62% | Functions 100% | Lines 88.65%
- routes/chat.js: 100% across all metrics
- models/TodoList.js: 100% across all metrics
- models/Message.js: 0% (untested)

Threshold status: Global branch coverage 63.63% is below configured threshold (80%), so the coverage task exits with code 1. All tests still pass.

## How to Reproduce
- Run all tests (no coverage):
  npm test -- --verbose

- Run with coverage report (may fail due to threshold):
  npm run test:coverage

Coverage HTML report at: coverage/lcov-report/index.html

## Recommendations
- Add branch-path tests in chatController to raise branch coverage over 80%
- Or temporarily relax coverageThreshold in jest.config.js (e.g., branches: 65)
- Add tests for models/Message.js
- Optional: mark API-reliant tests as integration and mock out by default

## Environment Notes
- .env is loaded by tests/setup.js using dotenv; .env is git-ignored
- Do not commit real API keys
