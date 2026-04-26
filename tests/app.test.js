const { test, expect, beforeEach } = require('@jest/globals');

// Reset modules to clear S
beforeEach(() => {
  jest.resetModules();
});

test('currentUser returns user when userId matches', () => {
  const { S, currentUser } = require('../app.js');

  S.users = [{ id: 'user-1', name: 'Alice' }, { id: 'user-2', name: 'Bob' }];
  S.userId = 'user-2';
  expect(currentUser()).toEqual({ id: 'user-2', name: 'Bob' });
});

test('currentUser returns undefined when userId does not match', () => {
  const { S, currentUser } = require('../app.js');

  S.users = [{ id: 'user-1', name: 'Alice' }];
  S.userId = 'user-2';
  expect(currentUser()).toBeUndefined();
});

test('currentUser returns undefined when users is empty', () => {
  const { S, currentUser } = require('../app.js');

  S.users = [];
  S.userId = 'user-1';
  expect(currentUser()).toBeUndefined();
});

test('currentUser returns undefined when userId is null', () => {
  const { S, currentUser } = require('../app.js');

  S.users = [{ id: 'user-1', name: 'Alice' }];
  S.userId = null;
  expect(currentUser()).toBeUndefined();
});

test('currentUser returns the first matching user when multiple users have the same id', () => {
  const { S, currentUser } = require('../app.js');

  S.users = [
    { id: 'user-1', name: 'Alice 1' },
    { id: 'user-1', name: 'Alice 2' }
  ];
  S.userId = 'user-1';
  expect(currentUser()).toEqual({ id: 'user-1', name: 'Alice 1' });
});
