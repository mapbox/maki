const maki = require('..');
const { writeFile } = require('fs');

writeFile(
  './browser.js',
  '/* eslint-disable */\nmodule.exports = ' + JSON.stringify(maki),
  function(err) {
    if (err) console.log(err);
    console.log('✓ Successfully generated browser.js');
  }
);
