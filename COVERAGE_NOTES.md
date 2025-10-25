# Coverage Report Notes

## Current Coverage Status

### Summary
- **TodoList.js Model**: 100% coverage ✅
- **chat.js Routes**: 100% coverage ✅
- **chatController.js**: 0% coverage (mocked in tests)
- **Message.js**: 0% coverage (not tested yet)

### Coverage Metrics
```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|--------
All files          |   19.11 |        0 |       0 |   19.11
controllers        |       0 |        0 |       0 |       0
  chatController.js|       0 |        0 |       0 |       0
models             |   59.37 |        0 |       0 |   59.37
  Message.js       |       0 |        0 |       0 |       0
  TodoList.js      |     100 |      100 |     100 |     100 ✅
routes             |     100 |      100 |     100 |     100 ✅
  chat.js          |     100 |      100 |     100 |     100 ✅
```

## Why Coverage is Low

The current test setup focuses on:
1. **Integration tests** - API routes with mocked controllers
2. **Unit tests** - Isolated functions and models

The controller functions are **intentionally mocked** in integration tests to:
- Avoid calling external APIs (Google AI)
- Avoid database connections during fast tests
- Test route behavior independently

## How to Improve Coverage

### Option 1: Test Controllers with Mocks (Recommended)
Create `tests/unit/chatController.test.js`:
```javascript
const chatController = require('../../controllers/chatController');

// Mock Google AI
jest.mock('@google/generative-ai');

// Mock TodoList model
jest.mock('../../models/TodoList');

describe('chatController.chatBA', () => {
  it('should generate todo list', async () => {
    // Test with mocked Google AI
  });
});
```

### Option 2: Lower Coverage Thresholds
In `jest.config.js`, adjust thresholds:
```javascript
coverageThreshold: {
  global: {
    branches: 50,  // Lower from 70%
    functions: 50,
    lines: 50,
    statements: 50,
  },
}
```

### Option 3: Exclude Untested Files
In `jest.config.js`:
```javascript
collectCoverageFrom: [
  'controllers/**/*.js',
  'models/**/*.js',
  'routes/**/*.js',
  '!**/node_modules/**',
  '!controllers/chatController.js', // Exclude if not testing yet
],
```

## Recommendations

For this initial setup, I recommend:

1. **Keep current tests** - They verify core functionality
2. **Add controller tests gradually** - Mock external dependencies
3. **Consider integration tests with test database** - For real DB testing
4. **Document tested vs untested areas** - Track progress

The test infrastructure is solid - you can now add more tests as needed!

## Running Tests

- **Quick tests**: `npm test` (no coverage check)
- **With coverage**: `npm run test:coverage` (shows this report)
- **Watch mode**: `npm run test:watch` (auto-rerun)

The coverage report HTML is in `coverage/lcov-report/index.html` - open it in a browser for detailed visualization!
