/**
 * @jest-environment jsdom
 */

const fs = require('fs');

describe('getVaccineBaseType', () => {

  beforeAll(() => {
    // Read the script
    const scriptContent = fs.readFileSync('app.js', 'utf8');

    // Create a script element
    const script = document.createElement('script');
    script.textContent = scriptContent;

    // Add stubbed DOM elements that app.js might be looking for on initialization to prevent it crashing
    document.body.innerHTML = `
      <div id="app-shell"></div>
    `;

    // Execute the script in the JSDOM environment
    document.body.appendChild(script);
  });

  describe('Happy Paths - Known Vaccine IDs', () => {
    it('should map bcg correctly', () => expect(window.getVaccineBaseType('bcg')).toBe('bcg'));

    it('should map hepb correctly', () => {
      expect(window.getVaccineBaseType('hepb-1')).toBe('hepb');
    });

    it('should map penta series correctly', () => {
      expect(window.getVaccineBaseType('penta-1')).toBe('penta');
      expect(window.getVaccineBaseType('penta-2')).toBe('penta');
      expect(window.getVaccineBaseType('penta-3')).toBe('penta');
    });

    it('should map ipv series correctly', () => {
      expect(window.getVaccineBaseType('ipv-1')).toBe('ipv');
      expect(window.getVaccineBaseType('ipv-2')).toBe('ipv');
      expect(window.getVaccineBaseType('ipv-3')).toBe('ipv');
      expect(window.getVaccineBaseType('ipv-b1')).toBe('ipv');
      expect(window.getVaccineBaseType('ipv-b2')).toBe('ipv');
    });

    it('should map rota series correctly', () => {
      expect(window.getVaccineBaseType('rota-1')).toBe('rota');
      expect(window.getVaccineBaseType('rota-2')).toBe('rota');
      expect(window.getVaccineBaseType('rota-3')).toBe('rota');
    });

    it('should map pcv series correctly', () => {
      expect(window.getVaccineBaseType('pcv-1')).toBe('pcv');
      expect(window.getVaccineBaseType('pcv-2')).toBe('pcv');
      expect(window.getVaccineBaseType('pcv-b')).toBe('pcv');
    });

    it('should map other common vaccines correctly', () => {
      expect(window.getVaccineBaseType('flu-1')).toBe('flu');
      expect(window.getVaccineBaseType('yellow-fever')).toBe('yellow-fever');
      expect(window.getVaccineBaseType('measles-1')).toBe('measles');
      expect(window.getVaccineBaseType('mmr-1')).toBe('mmr');
      expect(window.getVaccineBaseType('mmr-2')).toBe('mmr');
    });

    it('should map special and booster vaccines correctly', () => {
      expect(window.getVaccineBaseType('meningo-c')).toBe('meningo-c');
      expect(window.getVaccineBaseType('hepa-1')).toBe('hepa');
      expect(window.getVaccineBaseType('hepa-2')).toBe('hepa');
      expect(window.getVaccineBaseType('varicella-1')).toBe('varicella');
      expect(window.getVaccineBaseType('varicella-2')).toBe('varicella');
      expect(window.getVaccineBaseType('dtp-b1')).toBe('dtp');
      expect(window.getVaccineBaseType('dtp-b2')).toBe('dtp');
      expect(window.getVaccineBaseType('hpv-1')).toBe('hpv');
      expect(window.getVaccineBaseType('hpv-2')).toBe('hpv');
      expect(window.getVaccineBaseType('meningo-acwy')).toBe('meningo-acwy');
      expect(window.getVaccineBaseType('tdap')).toBe('tdap');
    });
  });

  describe('Edge Cases & Unknowns', () => {
    it('should return the original ID if the vaccine is unknown', () => {
      expect(window.getVaccineBaseType('unknown-vaccine')).toBe('unknown-vaccine');
      expect(window.getVaccineBaseType('custom-abc')).toBe('custom-abc');
      expect(window.getVaccineBaseType('penta-4')).toBe('penta-4'); // It's not in the map
    });

    it('should return falsy values as-is without crashing', () => {
      expect(window.getVaccineBaseType('')).toBe('');
      expect(window.getVaccineBaseType(null)).toBe(null);
      expect(window.getVaccineBaseType(undefined)).toBe(undefined);
    });

    it('should handle numeric inputs correctly (returning them as-is)', () => {
      expect(window.getVaccineBaseType(123)).toBe(123);
    });

    it('should handle objects correctly (returning them as-is)', () => {
      const obj = { id: 'penta-1' };
      expect(window.getVaccineBaseType(obj)).toBe(obj);
    });
  });
});
