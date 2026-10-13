const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createRequire } = require('node:module');
const path = require('node:path');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const { patchPackage, lockedPackages } = require('./patch-forge');

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
  const packages = lockedPackages(path.resolve(__dirname, '..'));
  assert.ok(packages.length > 0);
  const targets = packages.map(pkg => path.join(path.dirname(pkg), 'lib/rsa.js'));
  const before = targets.map(target => fs.readFileSync(target, 'utf8'));
  for (const source of before) {
    assert.match(source, /GHSA-86w9-cpqp-85rv/);
    assert.match(source, /\('parameters' in capture\) \? 2 : 1/);
  }
  execFileSync(process.execPath, ['scripts/patch-forge.js']);
  targets.forEach((target, index) => assert.equal(fs.readFileSync(target, 'utf8'), before[index]));
});

test('node-forge backport patches fresh installations and fails closed on drift', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'forge-patch-'));
  try {
    const packagePath = path.join(directory, 'package.json');
    const target = path.join(directory, 'lib/rsa.js');
    fs.mkdirSync(path.dirname(target));
    fs.writeFileSync(packagePath, JSON.stringify({ version: '1.4.0' }));
    fs.writeFileSync(target, 'if(obj.value.length !== 2) { throw new Error(); }');
    patchPackage(packagePath);
    const source = fs.readFileSync(target, 'utf8');
    assert.match(source, /\('parameters' in capture\) \? 2 : 1/);
    patchPackage(packagePath);
    assert.equal(fs.readFileSync(target, 'utf8'), source);
    fs.writeFileSync(target, 'unexpected source');
    assert.throws(() => patchPackage(packagePath), /Unexpected node-forge RSA source/);
    assert.equal(fs.readFileSync(target, 'utf8'), 'unexpected source');
    fs.writeFileSync(packagePath, JSON.stringify({ version: '1.4.1' }));
    assert.throws(() => patchPackage(packagePath), /Review\/remove/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

for (const packagePath of lockedPackages(path.resolve(__dirname, '..'))) {
test(`${path.relative(process.cwd(), packagePath)}: RSA rejects malformed DigestAlgorithm elements`, () => {
  const forge = require(path.dirname(packagePath));
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
  for (const elements of [[oid], [oid, nullParameter]]) {
    const info = make(asn1.Type.SEQUENCE, true, [
      make(asn1.Type.SEQUENCE, true, elements),
      make(asn1.Type.OCTETSTRING, false, digest.digest().getBytes()),
    ]);
    const signature = privateKey.sign(asn1.toDer(info).getBytes(), 'NONE');
    assert.equal(publicKey.verify(digest.digest().getBytes(), signature), true);
  }
  for (const elements of [
    [oid, nullParameter, garbage],
    [oid, garbage],
    [oid, make(asn1.Type.NULL, false, 'nonempty NULL')],
    [oid, asn1.create(asn1.Class.CONTEXT_SPECIFIC, asn1.Type.NULL, false, '')],
    [oid, make(asn1.Type.NULL, true, [])],
    [oid, nullParameter, nullParameter],
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
}

test('fresh node-forge reproduces the vulnerability before patching and rejects it afterward', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'forge-regression-'));
  try {
    const installed = path.dirname(lockedPackages(path.resolve(__dirname, '..'))[0]);
    const packagePath = path.join(directory, 'package.json');
    fs.copyFileSync(path.join(installed, 'package.json'), packagePath);
    fs.cpSync(path.join(installed, 'lib'), path.join(directory, 'lib'), { recursive: true });
    const target = path.join(directory, 'lib/rsa.js');
    const patchedSource = fs.readFileSync(target, 'utf8');
    // Reconstruct the upstream 1.4.0 condition, leaving the real verifier intact.
    // The negative control must accept the malformed structure, proving that
    // rejection after patching is caused by the backport rather than bad padding.
    const backport = /obj\.value\.length !== 2 \|\|\s*\/\/ GHSA-86w9-cpqp-85rv:[^\n]*\n\s*obj\.value\[0\]\.value\.length !==\s*\(\('parameters' in capture\) \? 2 : 1\) \|\|\s*\('parameters' in capture && capture\.parameters !== ''\)\) \{/g;
    assert.equal([...patchedSource.matchAll(backport)].length, 1);
    fs.writeFileSync(target, patchedSource.replace(backport, 'obj.value.length !== 2) {'));
    const probe = `
      const assert = require('node:assert/strict');
      const forge = require(process.argv[1]);
      const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 3 });
      const digest = forge.md.sha256.create().update('security regression').digest().getBytes();
      const a = forge.asn1;
      const make = (type, constructed, value) => a.create(a.Class.UNIVERSAL, type, constructed, value);
      const oid = make(a.Type.OID, false, a.oidToDer(forge.oids.sha256).getBytes());
      const nil = make(a.Type.NULL, false, '');
      const garbage = make(a.Type.OCTETSTRING, false, 'attacker-controlled padding');
      for (const elements of [[oid, nil, garbage], [oid, garbage]]) {
        const info = make(a.Type.SEQUENCE, true, [
          make(a.Type.SEQUENCE, true, elements),
          make(a.Type.OCTETSTRING, false, digest),
        ]);
        const signature = privateKey.sign(a.toDer(info).getBytes(), 'NONE');
        if (process.argv[2] === 'unpatched') {
          assert.equal(publicKey.verify(digest, signature), true);
        } else {
          assert.throws(() => publicKey.verify(digest, signature), /DigestInfo/);
        }
      }
    `;
    // Separate processes prevent require's cache from masking the source change.
    execFileSync(process.execPath, ['-e', probe, directory, 'unpatched']);
    patchPackage(packagePath);
    assert.equal(fs.readFileSync(target, 'utf8'), patchedSource);
    execFileSync(process.execPath, ['-e', probe, directory, 'patched']);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
