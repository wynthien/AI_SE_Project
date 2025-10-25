# Jest Testing Setup

This project uses Jest as the testing framework for unit and integration tests.

## 📁 Test Structure

```
tests/
├── setup.js                    # Jest setup configuration
├── unit/                       # Unit tests
│   ├── parseTodoList.test.js   # Tests for parseTodoList function
│   └── TodoList.model.test.js  # Tests for TodoList model
└── integration/                # Integration tests
    └── chat.routes.test.js     # Tests for API routes
```

## 🚀 Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- tests/unit/parseTodoList.test.js
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="parseTodoList"
```

## 📊 Coverage Thresholds

The project is configured with the following coverage thresholds:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

Coverage reports are generated in the `coverage/` directory.

## 🔧 Configuration

Jest configuration is in `jest.config.js`:
- **Test Environment**: Node.js
- **Test Match Pattern**: `**/*.test.js` or `**/*.spec.js` or files in `__tests__` folders
- **Setup File**: `tests/setup.js` (runs before each test suite)
- **Coverage Collection**: From `controllers/`, `models/`, and `routes/` directories

## 📝 Writing Tests

### Unit Test Example

```javascript
describe('MyFunction', () => {
  it('should do something', () => {
    const result = myFunction();
    expect(result).toBe(expectedValue);
  });
});
```

### Integration Test Example

```javascript
const request = require('supertest');
const app = require('../app');

describe('GET /api/endpoint', () => {
  it('should return 200', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
  });
});
```

## 🔍 Test Files

### Unit Tests
- `parseTodoList.test.js`: Tests the todo list parsing logic with various input formats
- `TodoList.model.test.js`: Tests the Mongoose model schema validation

### Integration Tests
- `chat.routes.test.js`: Tests the API endpoints including:
  - POST `/api/chat` - Generate todo list from user story
  - POST `/api/accept` - Save accepted todo list
  - GET `/api/todos` - Retrieve accepted todo lists

## 🎯 Mocking

The tests use Jest's mocking capabilities:
- Controllers are mocked in integration tests to isolate route testing
- Mongoose connection is mocked to avoid actual database connections during tests
- Google AI API is mocked using environment variables in `tests/setup.js`

## 📦 Dependencies

- **jest**: Testing framework
- **supertest**: HTTP assertions for API testing
- **@types/jest**: TypeScript definitions for better IDE support

## 🌍 Environment Variables

Test environment variables are set in `tests/setup.js`:
- `NODE_ENV=test`
- `GOOGLE_API_KEY=test-api-key`
- `MONGO_URI=mongodb://localhost:27017/test-db`

## 💡 Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **Test Organization**: Group related tests using `describe` blocks
3. **Isolation**: Each test should be independent and not rely on others
4. **Mocking**: Mock external dependencies (APIs, databases) to speed up tests
5. **Coverage**: Aim for high coverage but focus on meaningful tests
6. **Cleanup**: Clean up resources after tests when needed

## 🐛 Debugging Tests

### Run tests in debug mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open Chrome and navigate to `chrome://inspect` to attach the debugger.

### Verbose output
```bash
npm test -- --verbose
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
