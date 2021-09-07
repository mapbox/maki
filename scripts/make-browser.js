const maki = require('..');
const { writeFile } = require('fs');

writeFile(
  './browser.cjs.js',
  '/* eslint-disable */\nmodule.exports = ' + JSON.stringify(maki),
  function(err) {
    if (err) console.log(err);
    console.log('✓ Successfully generated browser.js');
  }
);

writeFile(
  './browser.esm.js',
  [
    '/* eslint-disable */',
    'export const layouts = ' + JSON.stringify(maki.layouts),
    'export const svgArray = ' + JSON.stringify(maki.svgArray)
  ].join('\n'),
  function(err) {
    if (err) console.log(err);
    console.log('✓ Successfully generated esm.js');
  }
);
