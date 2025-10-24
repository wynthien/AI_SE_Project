/**
 * Comprehensive Mocking Utilities
 * Using sinon, nock, jest-mock-extended for advanced mocking
 */

const sinon = require('sinon');
const nock = require('nock');

/**
 * Sinon-based Stubs & Spies
 */

// Stub for Google Generative AI
const createAIStub = () => {
  return sinon.stub().resolves({
    response: Promise.resolve({ text: () => 'Mocked AI response' })
  });
};

// Spy on method calls (without replacing)
const createSpy = (obj, method) => {
  return sinon.spy(obj, method);
};

/**
 * Nock-based HTTP Mocking
 */

// Mock external HTTP API calls
const mockExternalAPI = (baseURL, endpoint, responseData, statusCode = 200) => {
  return nock(baseURL)
    .get(endpoint)
    .reply(statusCode, responseData);
};

// Mock POST requests
const mockExternalAPIPost = (baseURL, endpoint, requestBody, responseData, statusCode = 200) => {
  return nock(baseURL)
    .post(endpoint, requestBody)
    .reply(statusCode, responseData);
};

// Mock API with delay
const mockExternalAPIWithDelay = (baseURL, endpoint, responseData, delayMs = 1000) => {
  return nock(baseURL)
    .get(endpoint)
    .delayConnection(delayMs)
    .reply(200, responseData);
};

/**
 * Clock & Timer Mocking (Sinon Fake Timers)
 */

const createFakeClock = () => {
  return sinon.useFakeTimers();
};

const restoreClock = (clock) => {
  clock.restore();
};

/**
 * Database/Model Mocking
 */

// Mock Mongoose model
const mockModel = (modelName, data = {}) => {
  return {
    name: modelName,
    create: sinon.stub().resolves(data),
    findById: sinon.stub().resolves(data),
    findByIdAndUpdate: sinon.stub().resolves(data),
    find: sinon.stub().resolves([data]),
    deleteOne: sinon.stub().resolves({ deletedCount: 1 })
  };
};

/**
 * Environment Variable Mocking
 */

const setEnvVars = (vars) => {
  Object.keys(vars).forEach(key => {
    process.env[key] = vars[key];
  });
};

const restoreEnvVars = (keys) => {
  keys.forEach(key => {
    delete process.env[key];
  });
};

/**
 * File System Mocking
 */

// Mock file operations (using jest manual mock)
const mockFileSystem = () => {
  return {
    readFileSync: sinon.stub().returns('mocked file content'),
    writeFileSync: sinon.stub().returns(undefined),
    existsSync: sinon.stub().returns(true)
  };
};

/**
 * Cleanup & Verification Helpers
 */

// Restore all stubs/spies
const restoreAllStubs = () => {
  sinon.restore();
  nock.cleanAll();
};

// Verify stub was called with specific args
const verifyStubCall = (stub, expectedArgs, times = 1) => {
  return stub.calledWith(...expectedArgs) && stub.callCount === times;
};

/**
 * Express Middleware Mocking
 */

const createMockNext = () => {
  return sinon.stub();
};

const mockErrorHandler = (error) => {
  return (req, res, next) => {
    res.status(error.status || 500).json({ error: error.message });
  };
};

module.exports = {
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
  
  // Export libraries for advanced use
  sinon,
  nock
};
