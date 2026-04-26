const { expect } = require('chai');
const fs = require('fs');
const { JSDOM } = require('jsdom');

describe('Service Worker Registration', () => {
  it('handles service worker registration errors and logs them', (done) => {
    const html = fs.readFileSync('index.html', 'utf8');
    const appCode = fs.readFileSync('app.js', 'utf8');

    let dom = new JSDOM(html, {
      url: "http://localhost",
      runScripts: "outside-only"
    });

    let window = dom.window;

    window.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    window.localStorage = { getItem: () => null, setItem: () => {} };
    window.matchMedia = () => ({ matches: false });

    let errorLogged = false;
    let loggedMessage = '';
    window.console.error = (...args) => {
      errorLogged = true;
      loggedMessage = args.join(' ');
    };

    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: {
        register: () => Promise.reject(new Error('Simulated SW registration failure'))
      },
      writable: true
    });

    dom.window.eval(appCode);
    window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

    // Wait for async operations
    setTimeout(() => {
      expect(errorLogged).to.be.true;
      expect(loggedMessage).to.include('Service Worker registration failed');
      done();
    }, 100);
  });
});
