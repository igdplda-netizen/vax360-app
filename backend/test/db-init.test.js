const { logResult } = require('../db-init');

describe('logResult', () => {
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    // Suppress console outputs and track calls
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should log error message when err is provided', () => {
    const logger = logResult('test_table');
    const mockError = new Error('Database error');

    logger(mockError);

    expect(consoleErrorSpy).toHaveBeenCalledWith('  ❌ test_table: Database error');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  test('should log success message when err is null or undefined', () => {
    const logger = logResult('test_table');

    logger();

    expect(consoleLogSpy).toHaveBeenCalledWith('  ✔  Table "test_table" ready');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('should log success message when err is null', () => {
    const logger = logResult('test_table');

    logger(null);

    expect(consoleLogSpy).toHaveBeenCalledWith('  ✔  Table "test_table" ready');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
