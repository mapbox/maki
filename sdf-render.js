var path = require('path');
var jsdom = require('jsdom').jsdom;
var SvgPath = require('svgpath');
var sdf = require('fontnik').pathToSDF;
var PNG = require('pngjs').PNG;
var through = require('through2');

var buffer = 3;
var cutoff = 2/8;

var w = 24,
    h = 24,
    wb = w + 2*buffer,
    hb = h + 2*buffer;


function renderFile(file) {
  var doc = jsdom(file.contents);

  var svg = doc.getElementsByTagName('svg')[0];
  var paths = doc.getElementsByTagName('path');

  for (var i = 0; i < paths.length; i++) {
      var path = paths[i];

      if ((!path.attributes.style || !/fill:#(44|45){3}/.test(path.attributes.style.value)) &&
          (!path.attributes.fill || !/#(44|45){3}/.test(path.attributes.fill.value)))
          continue;

      var svgPath = new SvgPath(path.attributes.d.value).abs().unshort();

      if (path.attributes.transform)
          svgPath.transform(path.attributes.transform.value);

      var parent = path.parentElement;
      while (parent.tagName === 'G') {
          if (parent.attributes.transform) {
              svgPath.transform(parent.attributes.transform.value);
          }
          parent = parent.parentElement;
      }

      if (svg.attributes.viewBox) {
          var viewBox = svg.attributes.viewBox.value.split(/\s+/);
          svgPath.translate(-viewBox[0], -viewBox[1]);
      }

      var commands = svgPath.segments.map(function(segment) {
          switch (segment[0]) {
              case 'M':
              case 'L':
                  return {
                    type: segment[0],
                    x: segment[1],
                    y: segment[2]
                  };
              case 'Q':
                  return {
                    type: segment[0],
                    x1: segment[1],
                    y1: segment[2],
                    x: segment[3],
                    y: segment[4]
                  };
              case 'C':
                  return {
                    type: segment[0],
                    x1: segment[1],
                    y1: segment[2],
                    x2: segment[3],
                    y2: segment[4],
                    x: segment[5],
                    y: segment[6]
                  };
              case 'Z':
                  return {type: segment[0]};
              default:
                  throw new Error('Unknown command: ' + segment[0]);
          }
      });

      var data = sdf(commands, w, h, buffer, cutoff);
      var png = new PNG({width: wb, height: hb});

      for (var j = 0; j < wb * hb; j++) {
          png.data[j*4]   = 0;
          png.data[j*4+1] = 0;
          png.data[j*4+2] = 0;
          png.data[j*4+3] = data[j];
      }

      return png.pack();
      console.log(png.pack());
      png.pack().pipe(file);
      return file;
  }
}

module.exports = function() {
  return through.obj(function(file, encoding, callback) {
    var buffers = [];
    var pngStream = renderFile(file);

    pngStream.on('data', function(d) { buffers.push(d); });
    pngStream.on('end', function() {
      file.contents = Buffer.concat(buffers);
      callback(null, file);
    });
  });
};
