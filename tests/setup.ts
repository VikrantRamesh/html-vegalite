// Test setup file for Jest

// Mock console.warn for tests that expect warnings
const originalWarn = console.warn;
beforeEach(() => {
  console.warn = jest.fn();
});

afterEach(() => {
  console.warn = originalWarn;
});
