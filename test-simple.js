const vm = require('vm');
const fs = require('fs');

const code = `
let currentLang = 'en';
function getGroupLabels() { return { test: currentLang }; }
`;

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

// let definitions do not attach to the global object in VM scripts!
console.log(sandbox.currentLang); // undefined
