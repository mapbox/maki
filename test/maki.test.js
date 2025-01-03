const fs = require('fs');
const test = require('tape');
const path = require('path');
const pify = require('pify');
const { parseString } = require('xml2js');
const maki = require('../');
const makiLayoutAll = require('../layouts/all');
const { readdir, readFile } = require('node:fs/promises');

const svgPath = path.join(__dirname, '../icons/');

test('index', function(t) {
  t.deepEqual(makiLayoutAll, maki.layouts, 'exports layout');
  t.end();
});

test('all.json layout ', function(t) {
  fs.readdir(svgPath, function(err, files) {
    var svgFiles = files.filter(function(file) {
      return (
        file
          .split('.')
          .pop()
          .indexOf('svg') !== -1
      );
    });
    var filtered = svgFiles
      .filter(function(file) {
        return file.indexOf('.svg') > -1;
      })
      .map(function(file) {
        return file.split('.svg')[0];
      });
    t.deepEqual(filtered, makiLayoutAll, 'includes all icons');
    t.end();
  });
});

test('valid svgs ', function(t) {
  fs.readdir(svgPath, function(err, files) {
    var svgFiles = files.filter(function(file) {
      return (
        file
          .split('.')
          .pop()
          .indexOf('svg') !== -1
      );
    });

    makiLayoutAll.forEach(function(name) {
      t.ok(svgFiles.indexOf(`${name}.svg`) >= 0, `${name}.svg exists`);
    });

    svgFiles.forEach(function(fileName, j) {
      fs.readFile('./icons/' + fileName, 'utf8', function(err, file) {
        if (err) t.fail(err);
        parseString(file, function(err, parsed) {
          if (err) t.fail(err);
          validateSvg(parsed.svg, fileName);
        });
      });
      if (j + 1 === svgFiles.length) {
        t.end();
      }
    });
  });

  function validateSvg(svg, fileName) {
    var errors = [],
      pixelUnitRegex = /^-?([0-9])+( ?px)?$/,
      height = parseFloat(svg.$.height),
      width = parseFloat(svg.$.width);

    function invalidElement(o) {
      var keys = Object.keys(o),
        invalid = false;

      keys.some(function(key) {
        invalid =
          key.match(
            /^(rectangle|circle|ellipse|line|polyline|polygon|style)$/
          ) && key;
        return invalid;
      });
      return invalid;
    }

    function checkPathLength(pathArray) {
      if (pathArray.length > 1) errors.push('too many paths');
    }

    function checkPaths(pathArray) {
      checkPathLength(pathArray);

      pathArray.forEach(function(path) {
        if (path.$ && path.$.transform) errors.push('transformed paths');
      });
    }

    function traverseGroups(groupArray) {
      groupArray.forEach(function(group) {
        if (group.$ && group.$.transform) errors.push('transformed groups');
        if (invalidElement(group)) errors.push(' has ' + invalidElement(group));
        if (group.path) {
          checkPaths(group.path);
        }
        if (group.g) {
          traverseGroups(group.g);
        }
      });
    }

    if (!(height === 15) || !(width === 15) || height !== width)
      errors.push('invalid size');

    if (
      parseFloat(svg.$.viewBox.split(' ')[2]) !== width ||
      parseFloat(svg.$.viewBox.split(' ')[3]) !== height
    )
      errors.push('invalid viewBox');

    if (svg.$.width && !svg.$.width.toString().match(pixelUnitRegex)) {
      errors.push('Width must use pixel units');
    }

    if (svg.$.height && !svg.$.height.toString().match(pixelUnitRegex)) {
      errors.push('Height must use pixel units');
    }

    if (
      svg.$.viewBox &&
      svg.$.viewBox.split(' ').some(v => !v.toString().match(pixelUnitRegex))
    ) {
      errors.push('Viewbox must use pixel units');
    }
    if (invalidElement(svg)) errors.push('has ' + invalidElement(svg));
    if (svg.g) traverseGroups(svg.g);
    if (svg.path) checkPaths(svg.path);

    t.notOk(
      errors.length,
      fileName +
        ' has ' +
        errors.length +
        ' errors' +
        (errors.length ? ':' : '') +
        errors.join(', ')
    );
  }
});

test('valid svgs with meta', async function(t) {
  const iconPath = path.join(__dirname, '../icons-meta/');
  const pParse = pify(parseString);
  const fileNames = await readdir(iconPath);

  fileNames
    .filter(
      f =>
        f
          .split('.')
          .pop()
          .indexOf('svg') !== -1
    )
    .forEach(async f => {
      const file = await readFile(path.join(iconPath, f), 'utf8');
      const data = await pParse(file);
      t.equal(
        data.svg.$['xmlns:m'],
        'https://www.mapbox.com',
        `xmlns:m is correct`
      );

      const metadataAttributes = [
        {
          'm:parameters': [
            {
              'm:parameter': [
                {
                  $: {
                    'm:name': 'background',
                    'm:type': 'color',
                    'm:value': '#000'
                  }
                },
                {
                  $: {
                    'm:name': 'stroke',
                    'm:type': 'color',
                    'm:value': '#fff'
                  }
                }
              ]
            }
          ]
        }
      ];

      t.deepEqual(
        data.svg['m:metadata'],
        metadataAttributes,
        `metadata is correct`
      );
    });

  t.end();
});
