/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Execute app.js in the global scope to simulate browser environment
const appJsCode = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

describe('syncFromCloud error handling', () => {
  beforeEach(() => {
    // Mock localStorage properly for JSDOM
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Mock console.log to suppress output and to verify it was called
    global.console.log = jest.fn();

    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('should catch network errors and log "Running offline or DB not reachable"', async () => {
    // We only need the syncFromCloud function from app.js, so we eval it with mocked globals
    // rather than running all the top-level init code or injecting as a script tag
    // since injecting the script could crash without elements.

    // However, app.js isn't a module.
    // We can extract just syncFromCloud, or we can mock $ so top-level script doesn't crash if it runs
    // Note: top level script in app.js has document.addEventListener('DOMContentLoaded', ...)
    // So the script itself won't execute DOM queries until DOMContentLoaded.
    // Let's inject it into a script tag so the functions become available globally.

    const scriptEl = document.createElement('script');
    scriptEl.textContent = appJsCode;
    document.head.appendChild(scriptEl);

    // Mock fetch to reject (simulate network error)
    global.fetch.mockRejectedValue(new Error('Network error'));

    // Wait for the script to be evaluated
    await new Promise(resolve => setTimeout(resolve, 0));

    // Call the function from window
    await window.syncFromCloud();

    // Assert that console.log was called with the correct message
    expect(global.console.log).toHaveBeenCalledWith('Running offline or DB not reachable');
  });
});
