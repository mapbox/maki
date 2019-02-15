const path = require('path');
const gatherFiles = require('./scripts/gather-files');
const iconSvgPath = path.join(__dirname, './icons');

module.exports = {
  layouts: {
    all: require('./layouts/all.json')
  },
  svgArray: gatherFiles(iconSvgPath)
};
