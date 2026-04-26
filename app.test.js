/**
 * @jest-environment jsdom
 */

// We will read app.js and eval it so it runs in the global scope of JSDOM
// To avoid triggering DOMContentLoaded listeners, we set up a mock before eval
document.addEventListener = jest.fn();
window.addEventListener = jest.fn();

const fs = require('fs');
const appJsCode = fs.readFileSync('app.js', 'utf8');
eval(appJsCode);

describe('uid', () => {
  it('should generate a string', () => {
    expect(typeof uid()).toBe('string');
  });

  it('should generate unique ids', () => {
    const id1 = uid();
    const id2 = uid();
    expect(id1).not.toBe(id2);
  });

  it('should have a reasonable length', () => {
    const id = uid();
    // Date.now().toString(36) is about 8 chars
    // Math.random().toString(36).slice(2,8) is 6 chars
    // Total is ~14 chars
    expect(id.length).toBeGreaterThanOrEqual(10);
    expect(id.length).toBeLessThanOrEqual(20);
  });
});
