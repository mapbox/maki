const test = require('tape');
const esbuild = require('esbuild');

const maki = require('../');
const fs = require('fs');
const path = require('path');

const browserEsmText = fs
  .readFileSync(path.resolve(__dirname, '..', './browser.esm.js'))
  .toString('utf8');

const transformed = esbuild.transformSync(browserEsmText, {
  format: 'cjs'
});

test('index', function(t) {
  t.assert(transformed.warnings.length === 0, 'no esbuild warnings');

  eval(transformed.code);
  t.deepEqual(
    maki,
    // Ran through eval.
    exports,
    'ESM bundle is the parseable and the same'
  );
  t.end();
});
