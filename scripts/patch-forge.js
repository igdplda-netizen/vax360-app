// GHSA-86w9-cpqp-85rv has no upstream release beyond node-forge 1.4.0.
// Reject extra elements in the nested DigestAlgorithm sequence. Keep the
// original package identity so dependency scanners continue reporting it
// until upstream ships a fix; behavioral regression tests verify this patch.
const fs = require('node:fs');
const path = require('node:path');

const packagePath = require.resolve('node-forge/package.json');
const { version } = require(packagePath);
if (version !== '1.4.0') {
  throw new Error(`Review/remove the RSA security backport for node-forge ${version}`);
}
const target = path.join(path.dirname(packagePath), 'lib/rsa.js');
const source = fs.readFileSync(target, 'utf8');
const original = 'obj.value.length !== 2) {';
const patched = `obj.value.length !== 2 ||
            // GHSA-86w9-cpqp-85rv: validate the nested AlgorithmIdentifier too.
            obj.value[0].value.length < 1 ||
            obj.value[0].value.length > 2 ||
            (obj.value[0].value.length === 2 &&
              (obj.value[0].value[1].type !== asn1.Type.NULL ||
               obj.value[0].value[1].value !== ''))) {`;

if (source.includes(patched)) {
  console.log('node-forge RSA security backport already applied.');
} else {
  if (source.split(original).length !== 2) {
    throw new Error('Unexpected node-forge RSA source; security backport was not applied.');
  }
  fs.writeFileSync(target, source.replace(original, patched));
  console.log('Applied node-forge nested DigestAlgorithm validation backport.');
}
