/**
 * Jest Setup File
 * This file runs before each test suite
 */

// Set test environment variables
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.GOOGLE_API_KEY = 'test-api-key';
process.env.MONGO_URI = 'mongodb://localhost:27017/test-db';

// Global test timeout
jest.setTimeout(10000);

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
