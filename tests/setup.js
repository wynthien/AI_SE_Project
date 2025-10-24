/**
 * Jest setup file - runs before tests
 * Suppress console errors in test output for cleaner reports
 */

// Suppress console.error for test scenarios
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn((...args) => {
    // Only suppress known error logs from test error scenarios
    if (args[0]?.toString?.().includes?.('Error:')) {
      return; // Suppress error logs from our error tests
    }
    originalError.call(console, ...args);
  });
});

afterAll(() => {
  console.error = originalError;
});
