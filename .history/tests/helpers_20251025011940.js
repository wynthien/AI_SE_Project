/**
 * Test helpers and utilities
 * Similar to common test utilities in professional projects
 */

/**
 * Mock Express request/response objects for testing
 */
const createMockRequest = (data = {}) => ({
  body: data.body || {},
  query: data.query || {},
  params: data.params || {},
  headers: data.headers || {}
});

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    statusCode: 200
  };
  return res;
};

/**
 * Test setup/teardown utilities
 */
const beforeAllTests = () => {
  // Global test setup
  process.env.NODE_ENV = 'test';
  process.env.GOOGLE_API_KEY = 'test-key-for-testing';
};

const afterAllTests = () => {
  // Global test cleanup
  jest.clearAllMocks();
};

module.exports = {
  createMockRequest,
  createMockResponse,
  beforeAllTests,
  afterAllTests
};
