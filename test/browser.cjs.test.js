const test = require('tape');

const maki = require('../');
const makiBrowser = require('../browser.cjs');

test('index', function(t) {
  t.deepEqual(
    maki,
    makiBrowser,
    'browser bundle is the parseable and the same'
  );
  t.end();
});
