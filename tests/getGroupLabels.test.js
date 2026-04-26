const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Extract just the part we need to test
const appJsSource = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

// Use regex to extract the GROUP_LABELS_I18N object and getGroupLabels function
const groupLabelsRegex = /(const GROUP_LABELS_I18N = {[\s\S]*?};)/;
const groupLabelsMatch = appJsSource.match(groupLabelsRegex);

const getGroupLabelsRegex = /(function getGroupLabels\(\) {[^}]*})/;
const getGroupLabelsMatch = appJsSource.match(getGroupLabelsRegex);

if (!groupLabelsMatch || !getGroupLabelsMatch) {
  throw new Error("Could not extract GROUP_LABELS_I18N or getGroupLabels from app.js");
}

function createTestContext() {
  const sandbox = {};
  vm.createContext(sandbox);

  const code = `
    let currentLang = 'en';

    ${groupLabelsMatch[1]}
    ${getGroupLabelsMatch[1]}

    // Attach to sandbox
    sandboxRef = {
      getGroupLabels: getGroupLabels,
      setCurrentLang: function(lang) { currentLang = lang; }
    };
  `;

  vm.runInContext(code, sandbox);
  return sandbox.sandboxRef;
}

describe('getGroupLabels', () => {
  let context;

  beforeEach(() => {
    context = createTestContext();
  });

  it('should return English labels when currentLang is en', () => {
    context.setCurrentLang('en');
    const labels = context.getGroupLabels();
    expect(labels.birth).toBe('🍼 At Birth');
    expect(labels['2m']).toBe('📅 2 Months');
    expect(labels['12m']).toBe('🎂 12 Months');
  });

  it('should return Portuguese labels when currentLang is pt', () => {
    context.setCurrentLang('pt');
    const labels = context.getGroupLabels();
    expect(labels.birth).toBe('🍼 Ao Nascer');
    expect(labels['2m']).toBe('📅 2 Meses');
    expect(labels['12m']).toBe('🎂 12 Meses');
  });

  it('should return French labels when currentLang is fr', () => {
    context.setCurrentLang('fr');
    const labels = context.getGroupLabels();
    expect(labels.birth).toBe('🍼 À la Naissance');
    expect(labels['2m']).toBe('📅 2 Mois');
    expect(labels['12m']).toBe('🎂 12 Mois');
  });

  it('should return Afrikaans labels when currentLang is af', () => {
    context.setCurrentLang('af');
    const labels = context.getGroupLabels();
    expect(labels.birth).toBe('🍼 By Geboorte');
    expect(labels['2m']).toBe('📅 2 Maande');
    expect(labels['12m']).toBe('🎂 12 Maande');
  });

  it('should fallback to English labels for unsupported language', () => {
    context.setCurrentLang('es'); // unsupported language
    const labels = context.getGroupLabels();
    expect(labels.birth).toBe('🍼 At Birth');
    expect(labels['2m']).toBe('📅 2 Months');
    expect(labels['12m']).toBe('🎂 12 Months');
  });

  it('should fallback to English labels if currentLang is missing or undefined', () => {
    context.setCurrentLang(undefined);
    const labels = context.getGroupLabels();
    expect(labels.birth).toBe('🍼 At Birth');
    expect(labels['2m']).toBe('📅 2 Months');
  });
});
