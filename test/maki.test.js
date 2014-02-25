var fs = require('fs'),
    assert = require('assert'),
    https = require('https');

describe('maki', function() {
    it('JSON', function() {
        assert.doesNotThrow(function() {
            JSON.parse(fs.readFileSync('./_includes/maki.json'));
        }, 'JSON is invalid');
    });

    describe('features', function() {
        var features = JSON.parse(fs.readFileSync('./_includes/maki.json'));

        features.forEach(function(f) {
            describe('feature: ' + f.name, function() {
                it('properties', function() {
                    assert.equal(typeof f.name, 'string');
                    assert.equal(typeof f.icon, 'string');
                    assert.equal(typeof f.tags, 'object');
                });
                describe('sources', function() {
                    [12, 18, 24].forEach(function(size) {
                        it(size, function() {
                            assert.doesNotThrow(function() {
                                fs.statSync('src/' + f.icon + '-' + size + '.svg');
                                fs.statSync('renders/' + f.icon + '-' + size + '.png');
                                fs.statSync('renders/' + f.icon + '-' + size + '@2x.png');
                            }, 'source file missing');
                        });
                    });
                });
            });
        });
    });

    describe('production endpoint', function() {
        var body = '';
        it('should be available', function(done) {
            https.get('https://www.mapbox.com/maki/www/maki.json', function(res) {
                assert.equal(res.statusCode, 200, 'cannot be found (HTTP ' + res.statusCode + ')');
                res.on('data', function(chunk) {
                    body += chunk;
                })
                res.on('end', function() {
                    done();
                });
            });
        });
        it('should parse', function() {
            assert.doesNotThrow(function() {
                JSON.parse(body.toString());
            }, 'JSON is invalid');
        });
    });
});
