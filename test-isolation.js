const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const appJsSource = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
const window = dom.window;
const document = window.document;

// Mock environment
window.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
window.document.getElementById = () => ({ addEventListener: () => {} });
window.document.querySelectorAll = () => ([]);
window.document.querySelector = () => ({ classList: { toggle: () => {} } });

// Run the script in the context of our mocked window
const script = document.createElement('script');
script.textContent = appJsSource;
document.body.appendChild(script);

const helper = document.createElement('script');
helper.textContent = `
  window.testGroupLabels = getGroupLabels;
  window.testSetLang = function(lang) { currentLang = lang; };
`;
document.body.appendChild(helper);

console.log("Labels initially:", window.testGroupLabels());
window.testSetLang('pt');
console.log("Labels after setting currentLang to pt:", window.testGroupLabels().birth);
