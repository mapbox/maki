const { promises: fs } = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const mkdirp = require('mkdirp');

const builder = new xml2js.Builder({
  rootName: 'svg',
  xmldec: { version: '1.0', encoding: 'UTF-8' }
});

const pReadFile = pify(fs.readFile);
const pReaddir = pify(fs.readdir);

function gatherIcons(iconPath) {
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

function write(cleanedSvgs, iconPath) {
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

module.exports = {
  write,
  gatherIcons
};
