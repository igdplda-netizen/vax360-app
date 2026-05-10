// Manual mocks for globals to allow requiring app.js in Node environment
if (typeof window === 'undefined') {
    global.window = {
        addEventListener: () => {},
        location: { hash: '' }
    };
}
if (typeof localStorage === 'undefined') {
    global.localStorage = {
        getItem: () => null,
        setItem: () => {}
    };
}
if (typeof document === 'undefined') {
    global.document = {
        addEventListener: () => {},
        getElementById: () => ({
            addEventListener: () => {},
            classList: { add: () => {}, remove: () => {}, contains: () => false },
            appendChild: () => {},
            querySelector: () => null,
            querySelectorAll: () => []
        }),
        querySelectorAll: () => [],
        querySelector: () => null,
        createElement: () => ({ setAttribute: () => {}, style: {} }),
        documentElement: { lang: 'en' }
    };
}
if (typeof navigator === 'undefined') {
    global.navigator = {
        language: 'en-US',
        serviceWorker: { register: () => Promise.resolve() }
    };
}

const { schedDate } = require('./app.js');

describe('schedDate', () => {
  beforeAll(() => {
    process.env.TZ = 'UTC';
  });

  test('adds 0 months correctly', () => {
    expect(schedDate('2023-01-01', 0)).toBe('2023-01-01');
  });

  test('adds positive months correctly', () => {
    expect(schedDate('2023-01-01', 2)).toBe('2023-03-01');
  });

  test('crosses year boundaries', () => {
    expect(schedDate('2023-11-01', 3)).toBe('2024-02-01');
  });

  test('handles end of month (Jan 31 + 1 month)', () => {
    // JS Date behavior: Jan 31 + 1 month -> Mar 3 (2023 is not a leap year, but Feb 31 overflows to March)
    expect(schedDate('2023-01-31', 1)).toBe('2023-03-03');
  });

  test('handles leap years (Feb 29)', () => {
    expect(schedDate('2024-02-29', 12)).toBe('2025-03-01');
  });

  test('adds many months', () => {
    expect(schedDate('2023-01-01', 24)).toBe('2025-01-01');
  });
});
