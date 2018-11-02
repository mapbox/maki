const fs = require('fs');
const path = require('path');
const pify = require('pify');
const xml2js = require('xml2js');
const mkdirp = require('mkdirp');

const pReadFile = pify(fs.readFile);
const pReaddir = pify(fs.readdir);

const builder = new xml2js.Builder({
  rootName: 'svg',
  xmldec: { version: '1.0', encoding: 'UTF-8' }
});
const iconPath = path.join(__dirname, '../icons');

function gatherIcons() {
  return pReaddir(iconPath).then(files => {
    const svgFiles = files.filter(f => f.indexOf('.svg') !== -1);

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

// Note: this function in impure, and mutates data input.
function clean({ fileName, data }) {
  const allowedEls = ['path', 'g'];
  Object.keys(data).forEach(k => {
    // $ refers to own properties
    if (k === '$') {
      return;
    }

    // Remove disallowed elements.
    if (!allowedEls.includes(k)) {
      delete data[k];
    } else {
      // clean child nodes if allowed element
      data[k].forEach(el => {
        clean({ fileName, data: el });
      });
    }
  });

  // Remove unsupported keys
  const allowedProps = [
    'version',
    'id',
    'xmlns',
    'width',
    'height',
    'viewBox',
    'd'
  ];

  if (data.$) {
    Object.keys(data.$).forEach(k => {
      if (!allowedProps.includes(k)) {
        delete data.$[k];
      }
    });
  }

  // Only runs on top level element
  if (data.$ && data.$.viewBox) {
    data.$.id = fileName.replace('.svg', '');
  }

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
