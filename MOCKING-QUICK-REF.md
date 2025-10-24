# Mocking Libraries - Quick Reference

## Installation Status ✅

All mocking libraries installed and ready:

```json
{
  "sinon": "Spy, Stub, Mock library",
  "nock": "HTTP request mocking",
  "supertest": "Express app testing",
  "jest-mock-extended": "Advanced Jest mocks",
  "@testing-library/jest-dom": "DOM matchers"
}
```

## Quick Start

### 1. Import Mocking Tools
```javascript
const sinon = require('sinon');
const nock = require('nock');
const { createMockRequest, createMockResponse } = require('./tests/helpers');
const { restoreAllStubs, mockExternalAPI } = require('./tests/mocks');
```

### 2. Create a Mock Function
```javascript
// Stub - replace function
const stub = sinon.stub().returns('mocked value');

// Spy - observe without replacing
const spy = sinon.spy();

// Jest mock
const jestMock = jest.fn().mockReturnValue('value');
```

### 3. Mock External API
```javascript
nock('https://api.example.com')
  .get('/data')
  .reply(200, { result: 'success' });
```

### 4. Verify Calls
```javascript
expect(stub.calledOnce).toBe(true);
expect(spy.calledWith('arg')).toBe(true);
expect(nock.isDone()).toBe(true);
```

### 5. Cleanup
```javascript
// In afterEach()
sinon.restore();
nock.cleanAll();
jest.clearAllMocks();
```

## Common Scenarios

### Scenario 1: Mock API Call
```javascript
test('fetch data from API', async () => {
  nock('https://api.example.com')
    .get('/users/1')
    .reply(200, { id: 1, name: 'John' });
  
  const response = await fetch('https://api.example.com/users/1');
  const user = await response.json();
  
  expect(user.name).toBe('John');
});
```

### Scenario 2: Mock Function Behavior
```javascript
test('controller calls service', async () => {
  const stub = sinon.stub(service, 'getData')
    .resolves({ value: 42 });
  
  const result = await controller.process();
  
  expect(result.value).toBe(42);
  stub.restore();
});
```

### Scenario 3: Mock Database
```javascript
test('save to database', () => {
  const saveStub = sinon.stub(db, 'save')
    .resolves({ id: 1 });
  
  db.save({ name: 'test' });
  
  expect(saveStub.calledOnce).toBe(true);
  saveStub.restore();
});
```

### Scenario 4: Mock Timers
```javascript
test('timeout handling', () => {
  const clock = sinon.useFakeTimers();
  
  setTimeout(() => { /* code */ }, 1000);
  clock.tick(1000);
  
  clock.restore();
});
```

## Files Structure

```
tests/
├── helpers.js                    # Request/Response mocks
├── mocks.js                      # Sinon/Nock utilities
├── setup.js                      # Global setup
├── mocking.examples.test.js      # 20+ mocking examples
├── chatController.test.js        # Tests using mocks
└── Message.test.js               # Model tests
```

## Key Methods Reference

### Sinon Stub
| Method | Purpose |
|--------|---------|
| `stub().returns(value)` | Return value |
| `stub().resolves(value)` | Return promise |
| `stub().rejects(error)` | Reject promise |
| `stub().callsFake(fn)` | Custom function |
| `.calledOnce` | Check called once |
| `.callCount` | Get call count |
| `.getCall(0)` | Get first call |
| `.args` | Call arguments |
| `.restore()` | Restore original |

### Nock
| Method | Purpose |
|--------|---------|
| `nock(url).get(path).reply(code, body)` | Mock GET |
| `nock(url).post(path, body).reply(code)` | Mock POST |
| `.delayConnection(ms)` | Add delay |
| `.times(n)` | Repeat n times |
| `nock.isDone()` | All mocks used? |
| `nock.pendingMocks()` | Unused mocks |
| `nock.cleanAll()` | Clean up |

### Jest Mock
| Method | Purpose |
|--------|---------|
| `jest.fn()` | Create mock |
| `.mockReturnValue(value)` | Return value |
| `.mockResolvedValue(value)` | Return promise |
| `.mockRejectedValue(error)` | Reject promise |
| `.mockClear()` | Reset calls |
| `.toHaveBeenCalled()` | Verify called |
| `.toHaveBeenCalledWith(args)` | Verify args |

## Running Tests

```bash
# All tests
npm test

# Mocking examples only
npm test -- tests/mocking.examples.test.js

# With coverage
npm run test:coverage

# In watch mode
npm run test:watch

# Debug mode
npm run test:debug
```

## Resources

- **Sinon.js**: https://sinonjs.org/releases/latest/
- **Nock**: https://github.com/nock/nock
- **Supertest**: https://github.com/visionmedia/supertest
- **Jest Mocking**: https://jestjs.io/docs/mock-functions

## Examples File

Full working examples: `tests/mocking.examples.test.js`

Run individual test:
```bash
npm test -- tests/mocking.examples.test.js -t "should return value"
```

## Tips & Tricks

1. **Always restore stubs** - Add in `afterEach()` to avoid test pollution
2. **Use descriptive stub names** - Makes debugging easier
3. **Mock at boundaries** - Mock external APIs, DB, filesystem
4. **Test real logic** - Don't over-mock, test actual behavior
5. **Verify interactions** - Check mocks were called correctly

## Troubleshooting

**Problem**: Tests hang
- **Solution**: Ensure mocks are cleaned up in `afterEach()`

**Problem**: Stub not working
- **Solution**: Import module AFTER jest.mock()

**Problem**: Nock not intercepting
- **Solution**: Ensure URL matches exactly, check for query params

**Problem**: Mock pollution between tests
- **Solution**: Call `sinon.restore()` and `nock.cleanAll()` in afterEach

## Next Steps

1. Review `MOCKING.md` for detailed patterns
2. Check `tests/mocking.examples.test.js` for 20+ examples
3. Add mocks to your own tests
4. Run: `npm test` to verify everything works
