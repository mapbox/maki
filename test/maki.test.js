const fs = require('fs');
const test = require('tape');
const path = require('path');
const pify = require('pify');
const xml2js = require('xml2js');
const makiLayoutAll = require('../layouts/all');
const { generateIconFromSvg, validate } = require('@mapbox/style-components');

const parseString = xml2js.parseString;
const svgPath = path.join(__dirname, '../icons/');

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
        return file.indexOf('-11.svg') > -1;
      })
      .map(function(file) {
        return file.split('-11.svg')[0];
      });
    t.deepEqual(filtered, makiLayoutAll.all, 'includes all icons');
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

    makiLayoutAll.all.forEach(function(name) {
      t.ok(svgFiles.indexOf(`${name}-11.svg`) >= 0, `${name}-11.svg exists`);
      t.ok(svgFiles.indexOf(`${name}-15.svg`) >= 0, `${name}-15.svg exists`);
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

    function checkPaths(pathArray) {
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

    if (
      !(height === 11 || height === 15) ||
      !(width === 11 || width === 15) ||
      height !== width
    )
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

/*
 * "Style components" are an experimental feature that power Mapbox's map design
 * workflow. Part of that workflow involves converting Maki SVGs into a JSON
 * icon format. Maki icons should generally be compatible with style components
 * after running the build script defined in package.json. If this test is
 * failin for you, reach out to @samanpwbb or another Mapboxer.
 */
test('svg are compatible with style components', (t) => {
  return pify(fs.readdir)(svgPath)
    .then(files => {
      return Promise.all(
        files
          .filter(f => f.indexOf('.svg') !== -1)
          .map(f => pify(fs.readFile)(path.join(svgPath, f), 'utf8'))
      );
    })
    .then(svgs => svgs.map(generateIconFromSvg))
    .then(iconDatum => {
      t.equal(validate.icons(iconDatum).length, 0);
      t.end();
    })
    .catch(e => {
      t.fail(e);
      t.end();
    });
});
