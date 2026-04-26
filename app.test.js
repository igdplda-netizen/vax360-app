const fs = require('fs');
const path = require('path');
const appJsCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

describe('load() function', () => {
  let S_ref;
  let load_ref;

  beforeEach(() => {
    // Reset DOM and global variables needed by app.js
    document.body.innerHTML = '';

    // Create necessary DOM elements so global queries in app.js do not fail during eval
    const createElement = (id, type = 'div') => {
      const el = document.createElement(type);
      el.id = id;
      document.body.appendChild(el);
    };

    // Some elements might be queried at top-level depending on the file, although app.js
    // wraps mostly in DOMContentLoaded. Let's provide basic structure just in case.
    createElement('splash');
    createElement('screen-login');
    createElement('screen-landing');
    createElement('toggle-theme', 'input');

    localStorage.clear();

    // Mock fetch to prevent errors from save() function
    window.fetch = jest.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));

    // Execute app.js in a separate VM to extract functions without top-level errors from window.eval
    // The previous eval worked because the top-level script only defines variables and attaches
    // event listeners (which JSDOM handles gracefully if elements are not there, using Optional Chaining or just failing inside the listener).
    const wrapper = `
      (function() {
        // Prevent DOMContentLoaded from firing and messing with the test
        const originalAddEventListener = document.addEventListener;
        document.addEventListener = function(type, listener, options) {
          if (type !== 'DOMContentLoaded') {
            originalAddEventListener.call(document, type, listener, options);
          }
        };
        ${appJsCode}
        document.addEventListener = originalAddEventListener;
        return { S, load, uid };
      })();
    `;
    const exports = window.eval(wrapper);
    S_ref = exports.S;
    load_ref = exports.load;
  });

  test('handles valid JSON in localStorage gracefully', () => {
    // Setup valid JSON in localStorage
    const validData = {
      users: [{ id: 'user1', name: 'John Doe' }],
      adminPin: '4321',
      adminProfiles: [{ id: 'admin1', name: 'SuperAdmin', email: '', pin: '4321' }]
    };
    localStorage.setItem('vt2', JSON.stringify(validData));

    load_ref();

    expect(S_ref.users).toEqual(validData.users);
    expect(S_ref.adminPin).toEqual('4321');
    expect(S_ref.adminProfiles).toEqual(validData.adminProfiles);
  });

  test('handles invalid JSON in localStorage gracefully and sets default admin', () => {
    // Setup initial state to non-empty
    S_ref.users = ['some data'];
    S_ref.adminProfiles = ['some admin data'];
    S_ref.adminPin = '1234';

    // Setup invalid JSON in localStorage
    localStorage.setItem('vt2', 'invalid json string');

    // Call load function
    load_ref();

    // Check that S.users and S.adminProfiles were reset due to the catch block
    expect(S_ref.users).toEqual([]);

    // The catch block sets S.adminProfiles to [], and then the condition `S.adminProfiles.length === 0` adds a default admin
    expect(S_ref.adminProfiles.length).toBe(1);
    expect(S_ref.adminProfiles[0].name).toBe('Admin');
    expect(S_ref.adminProfiles[0].pin).toBe('1234');
    expect(S_ref.adminProfiles[0].id).toBeDefined();
  });
});