#!/usr/bin/env node

var glob = require('glob');
var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var SvgPath = require('svgpath');
var sdf = require('fontnik').pathToSDF;
var PNG = require('pngjs').PNG;

var buffer = 3;
var cutoff = 2/8;

var w = 24,
    h = 24,
    wb = w + 2*buffer,
    hb = h + 2*buffer;

glob('src/*-24.svg', function (err, files) {
    if (err) throw err;
    files.forEach(function (file) {
        var name = file.match(/src\/(.*)-24\.svg/)[1];
        var doc = jsdom(fs.readFileSync(file).toString());

        var svg = doc.getElementsByTagName('svg')[0];
        var paths = doc.getElementsByTagName('path');
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];

            if (!path.attributes.style || !/fill:#(44|45){3}/.test(path.attributes.style.value))
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
                        return {type: segment[0], x: segment[1], y: segment[2]};
                    case 'Q':
                        return {type: segment[0], x1: segment[1], y1: segment[2], x: segment[3], y: segment[4]};
                    case 'C':
                        return {type: segment[0], x1: segment[1], y1: segment[2], x2: segment[3], y2: segment[4], x: segment[5], y: segment[6]};
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

            png.pack()
                .pipe(fs.createWriteStream('sdf/' + name + '.png'));

            return;
        }

        console.error('Couldn\'t find path for ' + name);
    });
});
