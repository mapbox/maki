const path = require('path');
const { gatherIcons, write } = require('./utils');

const iconPath = path.join(__dirname, '../icons');

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

    // if width or height attributes have px definitions then remove
    if (typeof data.$.width === 'string' || typeof data.$.height === 'string') {
      data.$.width = data.$.width.replace('px', '');
      data.$.height = data.$.height.replace('px', '');
    }
  }

  return data;
}

function formatIcons() {
  return gatherIcons(iconPath).then(svgs => {
    const cleanedSvgs = svgs.map(clean);
    write(cleanedSvgs, iconPath);
  });
}

module.exports = formatIcons;

if (require.main === module) {
  formatIcons();
}
