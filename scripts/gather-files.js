const fs = require('fs');
const path = require('path');

/**
 * Gathers contents of all files in a directory
 * @param {object} options – Parse is a boolean, if true, runs JSON.parse
 * on all file contents.
 * @param {string} dir - Path to directory of files.
 * @return {array} – array of file contents
 */
function gatherFiles(dir) {
  const list = fs.readdirSync(dir).filter(item => item.match(/.svg$/));
  return list.map(f => fs.readFileSync(path.join(dir, f), 'utf8'));
}

module.exports = gatherFiles;
