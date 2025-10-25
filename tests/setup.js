/**
 * Jest Setup File
 * This file runs before each test suite
 */

// Load environment variables from .env file
require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';

// Verify environment variables are loaded
if (!process.env.GOOGLE_API_KEY) {
  console.warn('⚠️  GOOGLE_API_KEY not found in .env file');
}
if (!process.env.MONGO_URI) {
  console.warn('⚠️  MONGO_URI not found in .env file');
}

// Global test timeout
jest.setTimeout(30000); // Increased to 30s for actual API calls

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
