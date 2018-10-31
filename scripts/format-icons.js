const fs = require('fs'),
  path = require('path'),
  pify = require('pify'),
  xml2js = require('xml2js'),
  mkdirp = require('mkdirp');

const pReadFile = pify(fs.readFile);
const pReaddir = pify(fs.readdir);

const builder = new xml2js.Builder({ rootName: 'svg' });
const iconPath = path.join(__dirname, '../icons');

function gatherIcons() {
  return pReaddir(iconPath).then(files => {
    const svgFiles = files.filter(f => f.indexOf('svg') !== -1);

    return Promise.all(
      svgFiles.map(f => pReadFile(path.join(iconPath, f), 'utf8'))
    )
      .then(svgs => {
        return Promise.all(
          svgs.map(svg => {
            // Need to create a parser for each svg
            const parser = new xml2js.Parser();
            const pParse = pify(parser.parseString);
            return pParse(svg);
          })
        );
      })
      .then(parsedSvgs => {
        return parsedSvgs.map((pSvg, i) => ({
          fileName: svgFiles[i],
          data: pSvg.svg
        }));
      });
  });
}

function clean({ fileName, data }) {
  // Clean top level keys
  const allowedKeys = ['version', 'id', 'xmlns', 'width', 'height', 'viewBox'];
  Object.keys(data.$).forEach(k => {
    if (!allowedKeys.includes(k)) {
      delete data.$[k];
    }
  });
  data.$.id = fileName.replace('.svg', '');

  return data;
}

function write(cleanedSvgs) {
  const pWrite = pify(fs.writeFile);
  return pify(mkdirp)(iconPath).then(
    Promise.all(
      cleanedSvgs.map(svgObj => {
        const svg = builder.buildObject(svgObj);
        pWrite(path.join(iconPath, `${svgObj.$.id}.svg`), svg, 'utf8');
      })
    )
  );
}

function formatIcons() {
  return gatherIcons().then(svgs => {
    const cleanedSvgs = svgs.map(clean);
    write(cleanedSvgs);
  });
}

module.exports = formatIcons;

if (require.main === module) {
  formatIcons();
}
