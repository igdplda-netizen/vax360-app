const { getVaccineBaseType } = require('../app.js');

describe('getVaccineBaseType', () => {
  it('extracts base type from numbered vaccines', () => {
    expect(getVaccineBaseType('penta-1')).toBe('penta');
    expect(getVaccineBaseType('penta-2')).toBe('penta');
    expect(getVaccineBaseType('penta-3')).toBe('penta');
    expect(getVaccineBaseType('ipv-1')).toBe('ipv');
    expect(getVaccineBaseType('pcv-1')).toBe('pcv');
  });

  it('keeps base type intact for vaccines without numbers', () => {
    expect(getVaccineBaseType('bcg')).toBe('bcg');
    expect(getVaccineBaseType('flu')).toBe('flu');
    expect(getVaccineBaseType('yellow-fever')).toBe('yellow-fever');
  });

  it('removes trailing booster suffix like "b1", "b2", or "b"', () => {
    expect(getVaccineBaseType('ipv-b1')).toBe('ipv');
    expect(getVaccineBaseType('ipv-b2')).toBe('ipv');
    expect(getVaccineBaseType('pcv-b')).toBe('pcv');
    expect(getVaccineBaseType('dtp-b1')).toBe('dtp');
  });

  it('handles custom vaccines by returning "custom"', () => {
    expect(getVaccineBaseType('custom-abc123')).toBe('custom');
    expect(getVaccineBaseType('custom-123')).toBe('custom');
    expect(getVaccineBaseType('custom')).toBe('custom');
  });

  it('handles vaccines with hyphens in base type that do not match patterns', () => {
    expect(getVaccineBaseType('meningo-acwy')).toBe('meningo-acwy');
    expect(getVaccineBaseType('meningo-c')).toBe('meningo-c');
  });
});
