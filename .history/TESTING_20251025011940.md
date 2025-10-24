# Testing Guide

This document explains how to run, debug, and maintain tests in this project.

## Quick Start

```bash
# Run tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Debug tests in VSCode
npm run test:debug
```

## Test Structure

Tests are organized following professional project patterns:

```
tests/
├── helpers.js              # Shared test utilities and mock factories
├── setup.js                # Global test setup/teardown
├── chatController.test.js  # ChatController unit & integration tests
└── Message.test.js         # Message model tests
```

## Running Tests

### 1. Run All Tests
```bash
npm test
```

Output includes:
- **Test Suites**: Number of test files passed/failed
- **Tests**: Number of test cases passed/failed  
- **Coverage**: Statement, Branch, Function, Line coverage percentages
- **HTML Report**: Generated at `test-results/test-report.html`

### 2. Watch Mode (for development)
```bash
npm run test:watch
```

Automatically re-runs tests when files change. Press `a` to run all tests, `q` to quit.

### 3. Coverage Report
```bash
npm run test:coverage
```

Generates detailed coverage report:
- Console output with coverage table
- HTML report with line-by-line coverage
- Located in `coverage/` and `test-results/` folders

## Debugging Tests

### Using VSCode Debugger

**Option 1: Debug Current Test File**
1. Open a `.test.js` file
2. Press `Ctrl+Shift+D` (or click Debug icon)
3. Select "Debug Tests (Jest)" from dropdown
4. Click ▶️ (Start Debugging)
5. Set breakpoints by clicking line numbers
6. Step through code with F10 (step over) or F11 (step into)

**Option 2: Debug All Tests**
1. Press `Ctrl+Shift+D`
2. Select "Debug All Tests"
3. Click ▶️ to start
4. Tests run with full coverage calculation

**Option 3: Command Line Debug**
```bash
npm run test:debug
```

This starts Node inspector. Connect via Chrome DevTools or VSCode debugger.

### Breakpoints & Inspection

In VSCode Debug:
- **Breakpoints**: Click line numbers to toggle
- **Conditional Breakpoints**: Right-click line → Add Conditional Breakpoint
- **Watch**: Add variable expressions in Watch panel
- **Call Stack**: View function call hierarchy
- **Step Controls**: 
  - F10 = Step over next line
  - F11 = Step into function
  - Shift+F11 = Step out of function
  - Ctrl+Shift+F5 = Restart

## Test Categories

### ChatController Tests (`tests/chatController.test.js`)

**Validation Tests**
- Missing message handling
- Empty message handling

**Success Tests**
- Basic chat response
- Special characters handling

**Error Handling**
- API error recovery
- Timeout error handling

**Business Analyst Mode**
- Todo list generation
- Section formatting validation
- Error handling for BA mode

### Message Model Tests (`tests/Message.test.js`)

**Schema Definition**
- Model name validation
- Required fields
- Default values

**Field Types**
- String, Date type validation

## Test Utilities (helpers.js)

### Mock Request/Response
```javascript
const { createMockRequest, createMockResponse } = require('./helpers');

const req = createMockRequest({ body: { message: 'test' } });
const res = createMockResponse();
```

### Global Setup
```javascript
const { beforeAllTests, afterAllTests } = require('./helpers');
```

## Coverage Targets

| Metric | Target | Current |
|--------|--------|---------|
| Statements | > 90% | 94.77% ✓ |
| Branches | > 85% | 91.66% ✓ |
| Functions | > 85% | 66.66% ⚠️ |
| Lines | > 90% | 94.77% ✓ |

## Adding New Tests

1. Create test file: `tests/newFeature.test.js`
2. Follow naming convention: describe blocks → test cases
3. Use provided helpers for consistency
4. Run `npm run test:watch` to develop iteratively
5. Ensure coverage doesn't drop: `npm run test:coverage`

Example:
```javascript
const { createMockRequest, createMockResponse } = require('./helpers');

describe('My Feature', () => {
  test('should do something', () => {
    const req = createMockRequest({ body: { data: 'test' } });
    const res = createMockResponse();
    
    expect(res.status).not.toHaveBeenCalled();
  });
});
```

## CI/CD Integration

Tests run automatically on:
- **Push to `main` or `develop`**
- **Pull Requests to `main` or `develop`**

Workflow file: `.github/workflows/test.yml`

Tests run on:
- Node 16.x, 18.x, 20.x
- Ubuntu latest

Results uploaded to:
- Codecov for coverage tracking
- GitHub Actions artifacts for test reports

## Troubleshooting

### Tests hang or timeout
```bash
# Run with verbose logging
npm run test:verbose
```

### Mocks not working
- Ensure mocks are set up **before** importing the module
- Use `jest.clearAllMocks()` in `beforeEach()`
- Check that module paths match exactly

### Coverage too low
```bash
npm run test:coverage
# Open test-results/test-report.html
# Click file to see uncovered lines
```

### Need to test current file only
```bash
npm test -- tests/chatController.test.js
```

## Best Practices

✅ **DO**
- Use descriptive test names
- Test one behavior per test
- Mock external dependencies
- Use test utilities (helpers)
- Clean up in `afterEach()`

❌ **DON'T**
- Test implementation details
- Skip error scenarios
- Create interdependent tests
- Ignore coverage warnings

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Jest API Reference](https://jestjs.io/docs/api)
- [Debug Node.js Apps](https://nodejs.org/en/docs/guides/debugging-getting-started/)
