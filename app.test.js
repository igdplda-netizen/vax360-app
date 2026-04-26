const { test } = require('node:test');
const assert = require('node:assert');

// Mock browser APIs required by app.js
global.window = { matchMedia: () => ({ matches: false }), location: { search: '' } };
global.document = {
  documentElement: { setAttribute: () => {}, removeAttribute: () => {} },
  createElement: () => ({ textContent: '', innerHTML: '' }),
  getElementById: () => ({
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {},
    innerHTML: '',
    value: '',
    checked: false
  }),
  addEventListener: () => {},
  querySelectorAll: () => []
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.navigator = { serviceWorker: { register: () => Promise.resolve() } };
global.$ = global.document.getElementById;

// Import the app
const { S, currentUser } = require('./app.js');

test('currentUser tests', async (t) => {
  await t.test('currentUser should return the user matching S.userId', () => {
    // Setup
    S.users = [
      { id: 'user1', name: 'Alice' },
      { id: 'user2', name: 'Bob' },
      { id: 'user3', name: 'Charlie' }
    ];
    S.userId = 'user2';

    // Execute
    const user = currentUser();

    // Assert
    assert.deepStrictEqual(user, { id: 'user2', name: 'Bob' });
  });

  await t.test('currentUser should return undefined if no user matches', () => {
    // Setup
    S.users = [
      { id: 'user1', name: 'Alice' }
    ];
    S.userId = 'user999';

    // Execute
    const user = currentUser();

    // Assert
    assert.strictEqual(user, undefined);
  });

  await t.test('currentUser should return undefined if S.users is empty', () => {
    // Setup
    S.users = [];
    S.userId = 'user1';

    // Execute
    const user = currentUser();

    // Assert
    assert.strictEqual(user, undefined);
  });

  await t.test('currentUser should handle null/undefined userId', () => {
    // Setup
    S.users = [
      { id: 'user1', name: 'Alice' }
    ];

    // Execute & Assert
    S.userId = null;
    assert.strictEqual(currentUser(), undefined);

    S.userId = undefined;
    assert.strictEqual(currentUser(), undefined);
  });
});
