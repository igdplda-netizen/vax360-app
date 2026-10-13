const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createRequire } = require('node:module');
const path = require('node:path');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const minimumVersions = {
  '@capacitor/android': '6.2.2',
  '@capacitor/ios': '6.2.2',
  handlebars: '4.7.10',
  'proxy-addr': '2.0.8',
  'js-yaml': '4.3.2',
  'source-map-js': '1.2.2',
  'brace-expansion': '2.1.7',
  'shell-quote': '1.11.0',
  undici: '6.28.1',
  compression: '1.8.2',
  sharp: '0.35.5',
  'ip-address': '10.7.1',
  dompurify: '3.4.16',
};
const semver = require('semver');

for (const directory of ['.', 'backend']) {
  test(`${directory}: every locked occurrence uses a patched version`, () => {
    const lock = JSON.parse(fs.readFileSync(path.join(directory, 'package-lock.json'), 'utf8'));
    for (const [location, pkg] of Object.entries(lock.packages)) {
      for (const [name, minimum] of Object.entries(minimumVersions)) {
        if (location.endsWith(`node_modules/${name}`)) {
          assert.ok(semver.gte(pkg.version, minimum), `${location}: ${pkg.version} < ${minimum}`);
        }
      }
      if (location.endsWith('node_modules/braces')) {
        assert.equal(pkg.name, '@dieub/braces-depth-guard');
        assert.equal(pkg.version, '3.0.3-pn.1');
      }
    }
    const backendRequire = createRequire(path.resolve(directory, 'package.json'));
    const micromatchRequire = createRequire(backendRequire.resolve('micromatch'));
    const braces = micromatchRequire('braces');
    assert.deepEqual(braces.expand('vaccine-{a,b}-{1..2}'), [
      'vaccine-a-1', 'vaccine-a-2', 'vaccine-b-1', 'vaccine-b-2',
    ]);
    assert.throws(() => braces('{'.repeat(3000) + 'a,b' + '}'.repeat(3000)), /depth/i);
    // Direct AST callers must also be bounded, not only the string parser.
    const ast = { type: 'root', nodes: [] };
    let node = ast;
    for (let i = 0; i < 200; i++) {
      const child = { type: 'brace', nodes: [], parent: node };
      node.nodes.push(child);
      node = child;
    }
    for (const operation of ['compile', 'expand', 'stringify']) {
      assert.throws(() => braces[operation](ast), /depth/i, operation);
    }
  });
}

test('node-forge security backport is present and idempotent', () => {
  const target = path.join(path.dirname(require.resolve('node-forge/package.json')), 'lib/rsa.js');
  const before = fs.readFileSync(target, 'utf8');
  assert.match(before, /GHSA-86w9-cpqp-85rv/);
  execFileSync(process.execPath, ['scripts/patch-forge.js']);
  assert.equal(fs.readFileSync(target, 'utf8'), before);
});

test('RSA accepts real signatures but rejects extra nested DigestAlgorithm elements', () => {
  const forge = require('node-forge');
  const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 3 });
  const digest = forge.md.sha256.create().update('vaccination record');
  assert.equal(publicKey.verify(digest.digest().getBytes(), privateKey.sign(digest)), true);
  assert.equal(
    publicKey.verify(forge.md.sha256.create().update('modified record').digest().getBytes(), privateKey.sign(digest)),
    false,
  );

  const asn1 = forge.asn1;
  const make = (type, constructed, value) => asn1.create(asn1.Class.UNIVERSAL, type, constructed, value);
  const oid = make(asn1.Type.OID, false, asn1.oidToDer(forge.oids.sha256).getBytes());
  const nullParameter = make(asn1.Type.NULL, false, '');
  const garbage = make(asn1.Type.OCTETSTRING, false, 'attacker-controlled padding');
  for (const elements of [
    [oid, nullParameter, garbage],
    [oid, garbage],
    [oid, make(asn1.Type.NULL, false, 'nonempty NULL')],
  ]) {
    const info = make(asn1.Type.SEQUENCE, true, [
      make(asn1.Type.SEQUENCE, true, elements),
      make(asn1.Type.OCTETSTRING, false, digest.digest().getBytes()),
    ]);
    // Sign attacker-controlled DigestInfo directly, with valid RSA padding,
    // so rejection proves structure checking, not a mismatched key/digest.
    const signature = privateKey.sign(asn1.toDer(info).getBytes(), 'NONE');
    assert.throws(() => publicKey.verify(digest.digest().getBytes(), signature), /DigestInfo/);
  }
});
