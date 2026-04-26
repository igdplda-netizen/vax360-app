const { ageStr, t, I18N, vaccineStatus } = require('./app.js');

describe('ageStr', () => {
  beforeEach(() => {
    // Reset any mocks
    jest.restoreAllMocks();
    global.currentLang = 'en';
  });

  it('should return days if less than 1 month old', () => {
    const today = new Date('2023-10-15T12:00:00.000Z');
    jest.useFakeTimers().setSystemTime(today);

    // 5 days old
    const birth = new Date('2023-10-10T12:00:00.000Z');
    expect(ageStr(birth)).toBe('5 days old');

    // 1 day old
    const birth1 = new Date('2023-10-14T12:00:00.000Z');
    expect(ageStr(birth1)).toBe('1 day old');

    // 0 days old
    const birth0 = new Date('2023-10-15T12:00:00.000Z');
    expect(ageStr(birth0)).toBe('0 days old');
  });

  it('should return months if between 1 month and 1 year old', () => {
    const today = new Date('2023-10-15T12:00:00.000Z');
    jest.useFakeTimers().setSystemTime(today);

    // 1 month old
    const birth1 = new Date('2023-09-15T12:00:00.000Z');
    expect(ageStr(birth1)).toBe('1 month');

    // 5 months old
    const birth5 = new Date('2023-05-15T12:00:00.000Z');
    expect(ageStr(birth5)).toBe('5 months');
  });

  it('should return years and months if over 1 year old', () => {
    const today = new Date('2023-10-15T12:00:00.000Z');
    jest.useFakeTimers().setSystemTime(today);

    // 1 year exactly
    const birth1 = new Date('2022-10-15T12:00:00.000Z');
    expect(ageStr(birth1)).toBe('1 yr');

    // 1 year, 2 months
    const birth1_2 = new Date('2022-08-15T12:00:00.000Z');
    expect(ageStr(birth1_2)).toBe('1 yr, 2 mo');

    // 2 years exactly
    const birth2 = new Date('2021-10-15T12:00:00.000Z');
    expect(ageStr(birth2)).toBe('2 yrs');

    // 3 years, 1 month
    const birth3_1 = new Date('2020-09-15T12:00:00.000Z');
    expect(ageStr(birth3_1)).toBe('3 yrs, 1 mo');
  });
});

describe('vaccineStatus', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should return completed if completedDate is present', () => {
    const v = { completedDate: '2023-10-15T12:00:00.000Z' };
    expect(vaccineStatus(v, null)).toBe('completed');
  });

  it('should return overdue if scheduled date is in the past', () => {
    const today = new Date('2023-10-15T12:00:00.000Z');
    jest.useFakeTimers().setSystemTime(today);

    const v = { scheduledDate: '2023-10-10T12:00:00.000Z' };
    expect(vaccineStatus(v, null)).toBe('overdue');
  });

  it('should return upcoming if scheduled date is within 30 days in the future', () => {
    const today = new Date('2023-10-15T12:00:00.000Z');
    jest.useFakeTimers().setSystemTime(today);

    const v = { scheduledDate: '2023-10-30T12:00:00.000Z' };
    expect(vaccineStatus(v, null)).toBe('upcoming');
  });

  it('should return pending if scheduled date is more than 30 days in the future', () => {
    const today = new Date('2023-10-15T12:00:00.000Z');
    jest.useFakeTimers().setSystemTime(today);

    const v = { scheduledDate: '2023-12-30T12:00:00.000Z' };
    expect(vaccineStatus(v, null)).toBe('pending');
  });
});
