var fs = require('fs'),
    test = require('tap').test,
    https = require('https'),
    jsdom = require('jsdom');

test('Maki', function(t) {
    t.doesNotThrow(function() {
        JSON.parse(fs.readFileSync(__dirname + '/../_includes/maki.json'));
    }, 'JSON is invalid');

    var features = JSON.parse(fs.readFileSync(__dirname + '/../_includes/maki.json'));

    features.forEach(function(f) {
        t.equal(typeof f.name, 'string', 'name property');
        t.equal(typeof f.icon, 'string', 'icon property');
        t.equal(typeof f.tags, 'object', 'tags property');
        [12, 18, 24].forEach(function(size) {
            t.doesNotThrow(function() {
                fs.statSync(__dirname + '/../src/' + f.icon + '-' + size + '.svg');
                fs.statSync(__dirname + '/../renders/' + f.icon + '-' + size + '.png');
                fs.statSync(__dirname + '/../renders/' + f.icon + '-' + size + '@2x.png');
            }, 'source file present');
            jsdom.env({
                html: fs.readFileSync(__dirname + '/../src/' + f.icon + '-' + size + '.svg'),
                done: function(errors, window) {
                    t.equal(
                        'rect',
                        window.document.getElementById('canvas')._tagName,
                        'SVG contains <rect> with id "canvas"'
                    );
                    t.equal(
                        'fill:none;stroke:none;visibility:hidden',
                        window.document.getElementById('canvas').getAttribute('style'),
                        'canvas element is hidden'
                    );
                    t.equal(
                        size.toString(),
                        window.document.getElementById('canvas').getAttribute('width'),
                        'canvas width matches icon size'
                    );
                    t.equal(
                        size.toString(),
                        window.document.getElementById('canvas').getAttribute('height'),
                        'canvas height matches icon size.'
                    );
                }
            });
        });
    });

    t.end();
});

test('production endpoint', function(t) {
    var body = '';
    https.get('https://www.mapbox.com/maki/www/maki.json', function(res) {
        t.equal(res.statusCode, 200, 'HTTP=' + res.statusCode);
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            t.doesNotThrow(function() {
                JSON.parse(body.toString());
            }, 'JSON is valid');
            t.end();
        });
    });
});
