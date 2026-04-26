/**
 * Test suite for the importData functionality in app.js
 */
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({}) }));

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('importData testing JSON parse error', () => {
    let window, document;
    let originalFileReader;

    beforeEach(() => {
        // Read app.js and index.html to set up jsdom environment
        const indexHtmlPath = path.resolve(__dirname, '../index.html');
        const indexHtmlCode = fs.readFileSync(indexHtmlPath, 'utf8');

        const appJsPath = path.resolve(__dirname, '../app.js');
        const appJsCode = fs.readFileSync(appJsPath, 'utf8');

        // Create isolated JSDOM instance
        const dom = new JSDOM(indexHtmlCode, {
            runScripts: "dangerously",
            url: "http://localhost/",
        });

        window = dom.window;
        document = window.document;

        // Expose fetch inside jsdom environment
        window.fetch = global.fetch;

        // Mock window.matchMedia before loading app.js
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        }));

        // Execute app.js in the JSDOM context
        const script = document.createElement('script');
        script.textContent = appJsCode;
        document.body.appendChild(script);

        // Keep a reference to original FileReader before mocking
        originalFileReader = window.FileReader;
    });

    afterEach(() => {
        if(window && window.FileReader && originalFileReader) {
            window.FileReader = originalFileReader;
        }
        jest.clearAllMocks();
    });

    it('should show error toast if JSON parsing fails', (done) => {
        // Mock toast and other functions
        window.toast = jest.fn();

        // Mock FileReader specifically for throwing JSON.parse error
        window.FileReader = class {
            constructor() {
                this.onload = null;
                this.result = null;
            }
            readAsText(file) {
                this.result = 'invalid json'; // Will cause JSON.parse to throw
                // Simulate asynchronous file read
                setTimeout(() => {
                    if (this.onload) this.onload({ target: { result: this.result } });
                }, 0);
            }
        };

        const fileContent = 'invalid json';
        const file = new window.File([fileContent], 'data.json', { type: 'application/json' });
        const event = { target: { files: [file], value: 'fake_path' } };

        window.importData(event);

        setTimeout(() => {
            // Note: window.t('error_reading') is what is actually called, we can check for the exact return or just what window.t returned
            expect(window.toast).toHaveBeenCalledWith(window.t('error_reading'));
            done();
        }, 50);
    });

    it('should successfully import valid JSON', (done) => {
        // Here we mock confirm2 so it automatically executes the callback
        window.confirm2 = jest.fn((t, m, cb) => cb());
        window.save = jest.fn();
        window.handleLogout = jest.fn();
        window.toast = jest.fn();

        const validJson = '{"users": [{"id": 1}], "adminPin": "1234", "adminProfiles": [{"id": 1}]}';

        window.FileReader = class {
            constructor() {
                this.onload = null;
                this.result = null;
            }
            readAsText(file) {
                this.result = validJson;
                // Simulate asynchronous file read
                setTimeout(() => {
                    if (this.onload) this.onload({ target: { result: this.result } });
                }, 0);
            }
        };

        const file = new window.File([validJson], 'data.json', { type: 'application/json' });
        const event = { target: { files: [file], value: 'fake_path' } };

        window.importData(event);

        setTimeout(() => {
            // Retrieve S through eval since let declarations are not attached to window
            const S = window.eval('S');
            expect(S.users).toEqual([{id: 1}]);
            expect(S.adminPin).toEqual("1234");
            expect(S.adminProfiles).toEqual([{id: 1}]);
            expect(window.toast).toHaveBeenCalledWith(window.t('data_imported'));
            expect(window.save).toHaveBeenCalled();
            expect(window.handleLogout).toHaveBeenCalled();
            done();
        }, 50);
    });
});
