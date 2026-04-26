/**
 * @jest-environment jsdom
 */

// mock document elements since they might cause issue when app.js evaluates in test mode
beforeAll(() => {
  document.documentElement.setAttribute = jest.fn();
  document.documentElement.removeAttribute = jest.fn();
});

const { getVaccineI18n } = require('../app.js');

describe('getVaccineI18n', () => {
  it('should return i18n data for a known vaccine and language', () => {
    const deps = { currentLang: 'pt', customVaccines: [] };
    const result = getVaccineI18n('bcg', deps);
    expect(result).toEqual({ name: 'BCG', desc: 'Protege contra a tuberculose (TB).', ageLabel: 'Ao Nascer' });
  });

  it('should fallback to VACCINE_SCHEDULE when translation is missing but vaccine exists in base schedule', () => {
    const deps = { currentLang: 'en', customVaccines: [] };
    const result = getVaccineI18n('bcg', deps);
    expect(result).toEqual({ name: 'BCG', desc: 'Protects against tuberculosis (TB).', ageLabel: 'At Birth' });
  });

  it('should return custom vaccine data if not in i18n and not in base schedule', () => {
    const deps = { currentLang: 'en', customVaccines: [{ id: 'custom-1', name: 'Custom Vaccine', desc: 'Custom Desc', ageLabel: 'Custom Age' }] };
    const result = getVaccineI18n('custom-1', deps);
    expect(result).toEqual({ name: 'Custom Vaccine', desc: 'Custom Desc', ageLabel: 'Custom Age' });
  });

  it('should return default object for unknown vaccine', () => {
    const deps = { currentLang: 'en', customVaccines: [] };
    const result = getVaccineI18n('unknown', deps);
    expect(result).toEqual({ name: 'unknown', desc: '', ageLabel: '' });
  });

  it('should handle undefined deps gracefully', () => {
    // testing backwards compatibility
    const result = getVaccineI18n('unknown');
    expect(result).toEqual({ name: 'unknown', desc: '', ageLabel: '' });
  });
});
