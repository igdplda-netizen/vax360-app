/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load app.js code
const code = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

// We evaluate app.js within a controlled context so we can export its functions.
const exportCode = `
module.exports = {
  getVaccineDetail,
  setCurrentLang: (lang) => { currentLang = lang; },
  getCurrentLang: () => currentLang,
  VACCINE_DETAIL
};
`;

const mod = eval(code + '\n' + exportCode);

describe('getVaccineDetail', () => {
  beforeEach(() => {
    // Reset to default language 'en'
    mod.setCurrentLang('en');
  });

  it('should return pros and cons for a standard vaccine (e.g., penta-1)', () => {
    const detail = mod.getVaccineDetail('penta-1');
    expect(detail).toHaveProperty('pros');
    expect(detail).toHaveProperty('cons');
    expect(detail.pros.length).toBeGreaterThan(0);
    expect(detail.cons.length).toBeGreaterThan(0);
    expect(detail.pros[0]).toContain('5 vaccines in 1');
  });

  it('should map vaccine IDs with variants (e.g. penta-2) to their base type', () => {
    const detail = mod.getVaccineDetail('penta-2');
    expect(detail.pros).toEqual(mod.getVaccineDetail('penta-1').pros);
  });

  it('should fallback to en if the translation for currentLang does not exist', () => {
    mod.setCurrentLang('unknown-lang');
    const detail = mod.getVaccineDetail('penta-1');
    expect(detail.pros[0]).toContain('5 vaccines in 1');
  });

  it('should use the correct language if available', () => {
    mod.setCurrentLang('pt');
    const detail = mod.getVaccineDetail('penta-1');
    expect(detail.pros[0]).toContain('5 vacinas em 1');
  });

  it('should return empty pros/cons object if vaccine ID base type does not exist at all', () => {
    const detail = mod.getVaccineDetail('unknown-vaccine');
    expect(detail).toEqual({ pros: [], cons: [] });
  });

  it('should return correct details when vaccine ID is the base type itself (e.g., bcg)', () => {
    const detail = mod.getVaccineDetail('bcg');
    expect(detail.pros[0]).toContain('Highly effective against severe childhood TB');
  });

  it('should fallback to en if translation language exists but base type does not exist in that language', () => {
      // Temporarily remove pt translation for penta to test fallback
      const originalPtPenta = mod.VACCINE_DETAIL.pt.penta;
      delete mod.VACCINE_DETAIL.pt.penta;

      mod.setCurrentLang('pt');
      const detail = mod.getVaccineDetail('penta-1');
      expect(detail.pros[0]).toContain('5 vaccines in 1'); // Fallback to en

      // Restore
      mod.VACCINE_DETAIL.pt.penta = originalPtPenta;
  });
});
