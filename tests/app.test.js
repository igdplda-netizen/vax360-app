/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Read app.js code
const appJsCode = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

describe('importData', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <input type="file" id="import-file" />
    `;

    // Setup globals that app.js expects
    window.S = { users: [], adminPin: null, adminProfiles: [] };
    window.t = (key) => key;
    window.toast = jest.fn();
    window.confirm2 = jest.fn((title, msg, cb) => cb());
    window.save = jest.fn();
    window.handleLogout = jest.fn();
    window.$ = (id) => document.getElementById(id);
    window.history = { pushState: jest.fn(), replaceState: jest.fn() };

    const start = appJsCode.indexOf('function importData(e) {');
    const end = appJsCode.indexOf('function handleClearAll() {', start);
    const importDataCode = appJsCode.substring(start, end).trim();

    // Execute just this function
    const runScript = new Function('window', 'document', 'S', 't', 'toast', 'confirm2', 'save', 'handleLogout', '$',
      importDataCode + '\nwindow.importData = importData;');

    runScript(window, document, window.S, window.t, window.toast, window.confirm2, window.save, window.handleLogout, window.$);
  });

  it('should test importData json parse error', () => {
    const file = new File(['invalid json'], 'test.json', { type: 'application/json' });
    const event = { target: { files: [file], value: 'test.json' } };

    // Check importData logic, it does:
    // const reader = new FileReader();
    // reader.onload = () => { try { const data = JSON.parse(reader.result); ... } catch { toast(t('error_reading')); } };
    // reader.readAsText(file);

    // Mock the global FileReader for this test
    window.FileReader = function() {
      return {
        readAsText: jest.fn(function() {
          // Setting the result to trigger JSON.parse error
          this.result = 'invalid json';
          // Trigger the onload event directly
          if (this.onload) {
            this.onload();
          }
        })
      };
    };

    window.importData(event);

    // Check if toast was called with 'error_reading'
    expect(window.toast).toHaveBeenCalledWith('error_reading');
  });
});
