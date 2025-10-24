# Mocking Libraries Guide

This guide covers professional mocking libraries installed in the project.

## Installed Libraries

| Library | Purpose | Use Case |
|---------|---------|----------|
| **sinon** | Spies, stubs, mocks | Function behavior control |
| **nock** | HTTP request mocking | External API simulation |
| **supertest** | HTTP server testing | Express route testing |
| **jest-mock-extended** | Advanced Jest mocks | TypeScript & complex mocks |
| **@testing-library/jest-dom** | DOM matchers | Additional assertions |

## 1. Sinon - Spies, Stubs, Mocks

### What is Sinon?
Sinon provides tools to replace functionality for testing:
- **Spy**: Observe function calls without changing behavior
- **Stub**: Replace function with test version
- **Mock**: Advanced stub with expectations

### Stub Examples

#### Basic Stub
```javascript
const sinon = require('sinon');

test('stub should return value', () => {
  const stub = sinon.stub().returns('stubbed value');
  
  const result = stub();
  
  expect(result).toBe('stubbed value');
  expect(stub.calledOnce).toBe(true);
});
```

#### Async Stub
```javascript
test('async stub should resolve', async () => {
  const stub = sinon.stub().resolves({ data: 'result' });
  
  const result = await stub();
  
  expect(result).toEqual({ data: 'result' });
});
```

#### Conditional Returns
```javascript
test('conditional returns based on arguments', () => {
  const stub = sinon.stub()
    .withArgs('admin').returns('admin access')
    .withArgs('user').returns('user access')
    .returns('guest');
  
  expect(stub('admin')).toBe('admin access');
  expect(stub('user')).toBe('user access');
  expect(stub('other')).toBe('guest');
});
```

### Spy Examples

#### Track Function Calls
```javascript
test('spy tracks function calls', () => {
  const obj = { method: (x) => x * 2 };
  const spy = sinon.spy(obj, 'method');
  
  obj.method(5);
  obj.method(10);
  
  expect(spy.callCount).toBe(2);
  expect(spy.calledWith(5)).toBe(true);
  expect(spy.getCall(0).args[0]).toBe(5);
  
  spy.restore();
});
```

### Fake Timers

```javascript
test('control time with fake timers', () => {
  const clock = sinon.useFakeTimers();
  const callback = sinon.spy();
  
  setTimeout(callback, 2000);
  clock.tick(2000);
  
  expect(callback.calledOnce).toBe(true);
  
  clock.restore();
});
```

### Sinon API Cheat Sheet

```javascript
const stub = sinon.stub();

// Setup return values
stub.returns('value');
stub.resolves({ data: 'result' });
stub.rejects(new Error('error'));

// Setup conditionals
stub.withArgs('arg1').returns('result1');

// Verify calls
stub.callCount;           // Number of calls
stub.called;              // Was it called?
stub.calledOnce;          // Called exactly once?
stub.calledTwice;         // Called exactly twice?
stub.calledWith(...args); // Called with these args?
stub.calledBefore(spy2);  // Called before another?

// Get call details
stub.getCall(0);          // First call
stub.getCall(0).args;     // Arguments of first call
stub.firstCall;           // First call shorthand
stub.lastCall;            // Last call shorthand

// Restore
stub.restore();           // Restore original
sinon.restore();          // Restore all stubs
```

## 2. Nock - HTTP Request Mocking

### What is Nock?
Nock intercepts HTTP requests and returns mocked responses. Perfect for testing code that calls external APIs.

### Basic HTTP Mocking

#### Mock GET Request
```javascript
const nock = require('nock');

test('mock GET request', async () => {
  nock('https://api.example.com')
    .get('/users')
    .reply(200, { users: [] });
  
  const response = await fetch('https://api.example.com/users');
  const data = await response.json();
  
  expect(data.users).toEqual([]);
});
```

#### Mock POST Request
```javascript
test('mock POST with body matching', async () => {
  nock('https://api.example.com')
    .post('/users', { name: 'John' })
    .reply(201, { id: 1, name: 'John' });
  
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'John' })
  });
  
  expect(response.status).toBe(201);
});
```

#### Mock Multiple Requests
```javascript
test('mock multiple sequential requests', async () => {
  nock('https://api.example.com')
    .get('/user/1')
    .reply(200, { id: 1, name: 'User 1' })
    .get('/user/2')
    .reply(200, { id: 2, name: 'User 2' });
  
  const res1 = await fetch('https://api.example.com/user/1');
  const res2 = await fetch('https://api.example.com/user/2');
  
  const user1 = await res1.json();
  const user2 = await res2.json();
  
  expect(user1.name).toBe('User 1');
  expect(user2.name).toBe('User 2');
});
```

#### Mock Delayed Responses
```javascript
test('mock delayed API response', async () => {
  nock('https://api.example.com')
    .get('/slow')
    .delayConnection(1000)
    .reply(200, { data: 'slow response' });
  
  const startTime = Date.now();
  await fetch('https://api.example.com/slow');
  const elapsed = Date.now() - startTime;
  
  expect(elapsed).toBeGreaterThanOrEqual(1000);
});
```

#### Mock Error Responses
```javascript
test('mock error response', async () => {
  nock('https://api.example.com')
    .get('/error')
    .reply(500, { error: 'Server error' });
  
  const response = await fetch('https://api.example.com/error');
  
  expect(response.status).toBe(500);
});
```

### Verify Nock Mocks

```javascript
test('verify all mocks were used', () => {
  nock('https://api.example.com')
    .get('/unused')
    .reply(200);
  
  // Don't call the endpoint
  
  expect(nock.isDone()).toBe(false);
  expect(nock.pendingMocks().length).toBe(1);
});

afterEach(() => {
  nock.cleanAll();  // Clean up all mocks
  nock.restore();   // Restore HTTP module
});
```

## 3. Supertest - HTTP Server Testing

### What is Supertest?
Supertest provides a high-level abstraction for testing HTTP servers.

### Express Route Testing

```javascript
const request = require('supertest');
const app = require('../app'); // Your Express app

describe('POST /api/chat', () => {
  test('should accept message and return reply', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ message: 'Hello' })
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('reply');
  });

  test('should return 400 for missing message', async () => {
    await request(app)
      .post('/api/chat')
      .send({})
      .expect(400);
  });
});
```

## 4. Jest-Mock-Extended

### Advanced Jest Mocking

```javascript
import { mock, mockDeep } from 'jest-mock-extended';

test('mock complex object', () => {
  const mockService = mock<UserService>();
  
  mockService.getUser.mockReturnValue({ id: 1, name: 'John' });
  
  expect(mockService.getUser()).toEqual({ id: 1, name: 'John' });
});
```

## Mocking Utilities in Project

File: `tests/mocks.js`

### Available Functions

```javascript
const {
  // Sinon utilities
  createAIStub,
  createSpy,
  createFakeClock,
  restoreClock,
  
  // Nock HTTP mocking
  mockExternalAPI,
  mockExternalAPIPost,
  mockExternalAPIWithDelay,
  
  // Model mocking
  mockModel,
  
  // Environment
  setEnvVars,
  restoreEnvVars,
  
  // File system
  mockFileSystem,
  
  // Cleanup
  restoreAllStubs,
  verifyStubCall,
  
  // Middleware
  createMockNext,
  mockErrorHandler,
  
  // Direct access
  sinon,
  nock
} = require('./tests/mocks');
```

## Common Patterns

### Pattern 1: Mock External API + Stub Service

```javascript
test('call external API through service', async () => {
  // Mock the HTTP call
  mockExternalAPI('https://api.example.com', '/data', { value: 42 });
  
  // Stub the service
  const serviceStub = sinon.stub(myService, 'getData')
    .resolves({ value: 42 });
  
  const result = await controller.process();
  
  expect(result.value).toBe(42);
  expect(nock.isDone()).toBe(true);
});
```

### Pattern 2: Mock Database + Spy on Methods

```javascript
test('database operation with spy', () => {
  const mockDB = mockModel('User', { id: 1, name: 'John' });
  const spy = sinon.spy(mockDB, 'create');
  
  mockDB.create({ name: 'John' });
  
  expect(spy.calledOnce).toBe(true);
  expect(spy.getCall(0).args[0]).toEqual({ name: 'John' });
});
```

### Pattern 3: Time-dependent Tests

```javascript
test('retry logic with timers', () => {
  const clock = sinon.useFakeTimers();
  const callback = sinon.spy();
  
  // Setup retry every 1 second, max 3 times
  let attempts = 0;
  const retry = setInterval(() => {
    attempts++;
    callback();
    if (attempts >= 3) clearInterval(retry);
  }, 1000);
  
  clock.tick(3000);
  
  expect(callback.callCount).toBe(3);
  clock.restore();
});
```

## Best Practices

✅ **DO**
- Use stubs for external dependencies
- Always call `sinon.restore()` or use `afterEach()`
- Clean up nock mocks with `nock.cleanAll()`
- Use spies to verify behavior without replacing
- Mock at system boundaries (APIs, DB, file system)

❌ **DON'T**
- Mock internal functions (test behavior instead)
- Forget to restore stubs (causes test pollution)
- Stub too much (use real functions when possible)
- Create brittle tests tied to implementation

## Running Mocking Examples

```bash
# Run mocking tests
npm test -- tests/mocking.examples.test.js

# Run with verbose output
npm run test:verbose -- tests/mocking.examples.test.js

# Debug specific test
npm run test:debug -- tests/mocking.examples.test.js
```

## Resources

- [Sinon Documentation](https://sinonjs.org/)
- [Nock GitHub](https://github.com/nock/nock)
- [Supertest npm](https://www.npmjs.com/package/supertest)
- [Jest Mock Extended](https://github.com/marchaos/jest-mock-extended)
