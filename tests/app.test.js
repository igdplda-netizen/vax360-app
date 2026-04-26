const fs = require('fs');
const path = require('path');
const vm = require('vm');

const appJsPath = path.join(__dirname, '../app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// A safer mock for VM environment
const context = {
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: () => ({ style: {} }),
    body: { appendChild: () => {}, removeChild: () => {} },
    location: { origin: '' }
  },
  window: {
    addEventListener: () => {},
    location: { origin: '' },
    crypto: { getRandomValues: () => new Uint32Array(1) }
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  navigator: { serviceWorker: { register: () => Promise.resolve() }, language: 'en-US' },
  location: { reload: () => {}, origin: '' }
};

// Also we can avoid evaluating all of app.js just to test `t()`.
// Since t() depends on I18N and currentLang which are defined right above it,
// we could extract just those parts, but evaluating app.js in a VM is actually okay
// since we just successfully did it with our custom context. The issue was JSDOM importing ESM.

vm.createContext(context);
try {
  vm.runInContext(appJsContent, context);
} catch (e) {
  console.log("Evaluation error in mock context:", e);
}

const setLang = (lang) => vm.runInContext(`currentLang = '${lang}';`, context);
const addTestTranslation = (lang, key, value) => vm.runInContext(`I18N['${lang}'] = I18N['${lang}'] || {}; I18N['${lang}']['${key}'] = '${value}';`, context);

describe('t() translation function', () => {
  beforeEach(() => {
    // Instead of re-assigning the constant I18N, we just add our test keys
    addTestTranslation('en', 'test_key_unique_123', 'Test English Value');
    setLang('en');
  });

  test('returns the translation for a valid key in the current language', () => {
    const result = vm.runInContext(`t('test_key_unique_123')`, context);
    expect(result).toBe('Test English Value');
  });

  test('falls back to English if the translation is missing in the current language', () => {
    addTestTranslation('test_fr', 'existing_fr_key', 'Test French Value');
    setLang('test_fr');

    // Should fallback to English for a key not in test_fr but present in en
    expect(vm.runInContext(`t('test_key_unique_123')`, context)).toBe('Test English Value');

    // Should use test_fr for a key present in it
    expect(vm.runInContext(`t('existing_fr_key')`, context)).toBe('Test French Value');
  });

  test('falls back to the key itself if not found anywhere', () => {
    expect(vm.runInContext(`t('non_existent_key_xyz')`, context)).toBe('non_existent_key_xyz');
  });

  test('handles a single replacement correctly', () => {
    addTestTranslation('en', 'test_replacements', 'Hello {name}, you have {count} messages.');
    const result = vm.runInContext(`t('test_replacements', { name: 'Alice', count: '5' })`, context);
    expect(result).toBe('Hello Alice, you have 5 messages.');
  });

  test('handles multiple occurrences of the same replacement key correctly using replaceAll', () => {
    addTestTranslation('en', 'test_multi', '{val} is {val}');
    const result = vm.runInContext(`t('test_multi', { val: 'A' })`, context);
    expect(result).toBe('A is A');
  });

  test('does not throw when replacements is null or undefined', () => {
    expect(() => vm.runInContext(`t('test_key_unique_123', null)`, context)).not.toThrow();
    expect(vm.runInContext(`t('test_key_unique_123', null)`, context)).toBe('Test English Value');
    expect(vm.runInContext(`t('test_key_unique_123', undefined)`, context)).toBe('Test English Value');
  });
});
