const fs = require('fs');
const path = require('path');

/**
 * Gathers contents of all files in a directory
 * @param {object} options – Parse is a boolean, if true, runs JSON.parse
 * on all file contents.
 * @param {string} dir - Path to directory of files.
 * @return {array} – array of file contents
 */

function gatherFiles(dir, { parse } = { parse: false }) {
  return fs
    .readdirSync(dir)
    .filter(f => f.match(/.(json|svg)$/))
    .map(f => fs.readFileSync(path.join(dir, f), 'utf8'))
    .map(f => (parse ? JSON.parse(f) : f));
}

module.exports = gatherFiles;
