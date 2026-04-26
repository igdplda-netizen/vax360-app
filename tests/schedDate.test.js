const fs = require('fs');
const path = require('path');
const vm = require('vm');

const appJsPath = path.resolve(__dirname, '../app.js');
const appJsCode = fs.readFileSync(appJsPath, 'utf8');

const sandbox = {
  document: {
    getElementById: () => ({ classList: { add: () => {}, remove: () => {} }, style: {} }),
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {},
  },
  window: {
    addEventListener: () => {},
    location: { hash: '' },
    matchMedia: () => ({ matches: false }),
  },
  navigator: {
    language: 'en-US'
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  },
  console: console,
  Date: Date,
  Math: Math,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  module: { exports: {} },
};

vm.createContext(sandbox);
vm.runInContext(appJsCode, sandbox);

const schedDateFn = sandbox.module.exports.schedDate;

describe('schedDate', () => {
  const originalTz = process.env.TZ;

  beforeAll(() => {
    // Set fixed timezone to prevent flakiness locally vs CI.
    process.env.TZ = 'UTC';
  });

  afterAll(() => {
    process.env.TZ = originalTz;
  });

  it('should be defined', () => {
    expect(schedDateFn).toBeDefined();
    expect(typeof schedDateFn).toBe('function');
  });

  it('should add months correctly within the same year', () => {
    expect(schedDateFn('2023-01-15', 2)).toBe('2023-03-15');
    expect(schedDateFn('2023-05-10', 5)).toBe('2023-10-10');
  });

  it('should handle year rollover when adding months', () => {
    expect(schedDateFn('2023-11-15', 2)).toBe('2024-01-15');
    expect(schedDateFn('2023-08-20', 14)).toBe('2024-10-20');
  });

  it('should handle adding 0 months', () => {
    expect(schedDateFn('2023-05-10', 0)).toBe('2023-05-10');
  });

  it('should handle leap years wrapping to March 1st', () => {
    expect(schedDateFn('2024-02-29', 12)).toBe('2025-03-01');
  });

  it('should handle end of month correctly wrapping to next month', () => {
    expect(schedDateFn('2023-01-31', 1)).toBe('2023-03-03');
  });
});
