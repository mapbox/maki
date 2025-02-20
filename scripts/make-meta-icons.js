/*
  Create icons with stroke and m:parameter options for 
  custom icon attribute styling in our SDKs.
 */
const path = require('path');
const { gatherIcons, write } = require('./utils');

function metaMap({ data }) {
  data['$'] = {
    ...data['$'],
    'xmlns:m': 'https://www.mapbox.com',
    viewBox: '0 0 23 23',
    height: '23',
    width: '23'
  };

  data.path.forEach((p, index) => {
    p.$ = {
      ...p.$,
      transform: 'translate(4 4)',
      fill: '#000000'
    };

    // Add a stroked shape to below by unshifting an item into the array
    data.path.unshift({
      $: {
        ...data.path[index].$,
        style: 'stroke-linejoin:round;stroke-miterlimit:4;',
        transform: 'translate(4 4)',
        stroke: '#ffffff',
        'stroke-width': 4
      }
    });
  });

  data['m:metadata'] = {
    ['m:parameters']: {
      ['m:parameter']: [
        {
          $: {
            ['m:name']: 'background',
            ['m:type']: 'color',
            ['m:value']: '#000000'
          }
        },
        {
          $: {
            ['m:name']: 'stroke',
            ['m:type']: 'color',
            ['m:value']: '#ffffff'
          }
        }
      ]
    }
  };

  return data;
}

async function makeMetaIcons() {
  const svgs = await gatherIcons(path.join(__dirname, '../icons'));
  const metaMappedIcons = svgs.map(metaMap);
  return write(metaMappedIcons, path.join(__dirname, '../icons-meta'));
}

module.exports = makeMetaIcons;

if (require.main === module) {
  makeMetaIcons();
}
