const { readdir, readFile, writeFile, mkdir } = require('node:fs/promises');
const path = require('path');
const pify = require('pify');
const xml2js = require('xml2js');

const builder = new xml2js.Builder({
  rootName: 'svg',
  xmldec: { version: '1.0', encoding: 'UTF-8' }
});

async function gatherIcons(iconPath) {
  const files = await readdir(iconPath);
  const svgFiles = files.filter(f => f.endsWith('.svg'));

  const svgs = await Promise.all(
    svgFiles.map(f => readFile(path.join(iconPath, f), 'utf8'))
  );

  const parsedSvgs = await Promise.all(
    svgs.map(svg => {
      // Need to create a parser for each svg
      const parser = new xml2js.Parser();
      const pParse = pify(parser.parseString);
      return pParse(svg);
    })
  );

  return parsedSvgs.map((pSvg, i) => ({
    fileName: svgFiles[i],
    data: pSvg.svg
  }));
}

async function write(cleanedSvgs, iconPath) {
  await mkdir(iconPath, { recursive: true });
  return Promise.all(
    cleanedSvgs.map(svgObj => {
      const svg = builder.buildObject(svgObj);
      return writeFile(path.join(iconPath, `${svgObj.$.id}.svg`), svg, 'utf8');
    })
  );
}

module.exports = {
  write,
  gatherIcons
};
