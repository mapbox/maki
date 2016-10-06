var fs = require('fs'),
    path = require('path'),
    test = require('tape'),
    xml2js = require('xml2js'),
    makiLayoutAll = require('../layouts/all');

var parseString = xml2js.parseString;

test('all.json layout ', function(t) {
  fs.readdir('./icons/', function(err, files) {
    var svgFiles = files.filter(function(file) {
      return file.split('.').pop().indexOf('svg') !== -1;
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

  fs.readdir('./icons/', function(err, files) {
    var svgFiles = files.filter(function(file) {
      return file.split('.').pop().indexOf('svg') !== -1;
    });

    svgFiles.forEach(function(fileName, j) {
      function endsWith(str, test) {
        return str.lastIndexOf(test) === (str.length - test.length);
      }

      t.ok(endsWith(fileName,'-11.svg') || endsWith(fileName,'-15.svg'), fileName + ' filename ends with "-11.svg or "-15.svg"');

      fs.readFile('./icons/' + fileName, 'utf8', function(err, file) {
          if (err) t.fail(err);
          parseString(file, function(err, parsed) {
            if (err) t.fail(err);
            validateSvg(parsed.svg, fileName);
          });
      });
      if ((j+1) === svgFiles.length) {
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
        invalid = key.match(/^(rectangle|circle|ellipse|line|polyline|polygon|style)$/) && key;
        return invalid;
      });
      return invalid;
    }

    function checkPaths(pathArray) {
      pathArray.forEach(function(path) {
        if (path.$ && path.$.transform) errors.push('transformed paths');
      });
    };

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

    if (!(height === 11 || height === 15) ||
      !(width === 11 || width === 15) ||
      height !== width) errors.push('invalid size');

    if (parseFloat(svg.$.viewBox.split(' ')[2]) !== width ||
      parseFloat(svg.$.viewBox.split(' ')[3]) !== height) errors.push('invalid viewBox');

    if (svg.$.width && !svg.$.width.toString().match(pixelUnitRegex)) {
      errors.push('Width must use pixel units');
    }

    if (svg.$.height && !svg.$.height.toString().match(pixelUnitRegex)) {
      errors.push('Height must use pixel units');
    }

    if (svg.$.viewBox && svg.$.viewBox.split(' ').some(v => !v.toString().match(pixelUnitRegex))) {
      errors.push('Viewbox must use pixel units');
    }
    if (invalidElement(svg)) errors.push('has ' + invalidElement(svg));
    if (svg.g) traverseGroups(svg.g);
    if (svg.path) checkPaths(svg.path);


    t.notOk(errors.length, fileName + ' has ' + errors.length + ' errors' + (errors.length ? ':' : '') + errors.join(', '));

  };

});
