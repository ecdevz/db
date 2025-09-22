// Jest setup file
// Add any global test setup here

// Suppress console logs during tests unless explicitly needed
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.debug = jest.fn();
}