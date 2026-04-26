/**
 * @jest-environment jsdom
 */

const { vaccineStatus } = require('../app');

describe('vaccineStatus', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return "completed" if v.completedDate is set', () => {
    const v = { completedDate: '2023-01-01', scheduledDate: '2023-01-01' };
    expect(vaccineStatus(v)).toBe('completed');
  });

  it('should return "overdue" if scheduledDate is before today', () => {
    jest.setSystemTime(new Date('2023-05-15T00:00:00Z'));
    const v = { scheduledDate: '2023-05-10T00:00:00Z' };
    expect(vaccineStatus(v)).toBe('overdue');
  });

  it('should return "upcoming" if scheduledDate is within 30 days from today', () => {
    jest.setSystemTime(new Date('2023-05-15T00:00:00Z'));
    const v = { scheduledDate: '2023-05-30T00:00:00Z' };
    expect(vaccineStatus(v)).toBe('upcoming');
  });

  it('should return "pending" if scheduledDate is more than 30 days from today', () => {
    jest.setSystemTime(new Date('2023-05-15T00:00:00Z'));
    const v = { scheduledDate: '2023-07-01T00:00:00Z' };
    expect(vaccineStatus(v)).toBe('pending');
  });
});
