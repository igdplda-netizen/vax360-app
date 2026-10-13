// GHSA-86w9-cpqp-85rv has no upstream release beyond node-forge 1.4.0.
// Reject extra elements in the nested DigestAlgorithm sequence. Keep the
// original package identity so dependency scanners continue reporting it
// until upstream ships a fix; behavioral regression tests verify this patch.
const fs = require('node:fs');
const path = require('node:path');

const original = 'obj.value.length !== 2) {';
const previousPatch = `obj.value.length !== 2 ||
            // GHSA-86w9-cpqp-85rv: validate the nested AlgorithmIdentifier too.
            obj.value[0].value.length < 1 ||
            obj.value[0].value.length > 2 ||
            (obj.value[0].value.length === 2 &&
              (obj.value[0].value[1].type !== asn1.Type.NULL ||
               obj.value[0].value[1].value !== ''))) {`;
// Match upstream PR #1152's element count check against captured parameters,
// retaining the stricter requirement that any NULL parameter must be empty.
const patched = `obj.value.length !== 2 ||
            // GHSA-86w9-cpqp-85rv: validate the nested AlgorithmIdentifier too.
            obj.value[0].value.length !==
              (('parameters' in capture) ? 2 : 1) ||
            ('parameters' in capture && capture.parameters !== '')) {`;

function patchPackage(packagePath) {
  const { version } = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (version !== '1.4.0') {
    throw new Error(`Review/remove the RSA security backport for node-forge ${version}`);
  }
  const target = path.join(path.dirname(packagePath), 'lib/rsa.js');
  const source = fs.readFileSync(target, 'utf8');
  if (source.includes(patched)) {
    console.log(`node-forge RSA security backport already applied: ${target}`);
    return;
  }
  const expected = source.includes(previousPatch) ? previousPatch : original;
  if (source.split(expected).length !== 2) {
    throw new Error(`Unexpected node-forge RSA source; security backport was not applied: ${target}`);
  }
  fs.writeFileSync(target, source.replace(expected, patched));
  console.log(`Applied node-forge nested DigestAlgorithm validation backport: ${target}`);
}

function lockedPackages(root) {
  const packages = [];
  for (const directory of ['.', 'backend']) {
    const lock = JSON.parse(fs.readFileSync(path.join(root, directory, 'package-lock.json'), 'utf8'));
    for (const location of Object.keys(lock.packages)) {
      if (location.endsWith('node_modules/node-forge')) {
        packages.push(path.join(root, directory, location, 'package.json'));
      }
    }
  }
  return packages;
}

if (require.main === module) {
  for (const packagePath of lockedPackages(path.resolve(__dirname, '..'))) {
    patchPackage(packagePath);
  }
}

module.exports = { patchPackage, lockedPackages };
