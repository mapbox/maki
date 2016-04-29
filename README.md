[![Circle CI](https://circleci.com/gh/mapbox/maki-2.svg?style=svg)](https://circleci.com/gh/mapbox/maki-2)

# Maki

A pixel-aligned point of interest icon set made for cartographers.

This repo only contains the source SVG files. Check out [maki website](https://mapbox.com/maki-icons/) to use an icon editing tool and read detailed design guidelines.

### Format

- Source icons are in the SVG file format.
- Icons are available in two sizes: 11px x 11px and 15px x 15px.
- Icons are each a single unified SVG path, with no transforms, groups or strokes.

### Contributing

Maki welcomes contributions from designers who need icons for specific points of interest. Check out the [design guidelines](https://www.mapbox.com/maki-icons/guidelines/) before submitting a pull request. Pull requests will only be merged if all tests pass.

### Testing

Every icon in Maki must pass the automated tests in [tests/maki.test.js](https://github.com/mapbox/maki/tree/master/test/maki.test.js). These tests check the following:

- Filename must end with '-11.svg' or '-15.svg'.
- SVG file cannot contain the following elements: rectangle, circle, ellipse, line, polyline, polygon.
- SVG file cannot contain transformed groups or paths.
- Both height and width must equal 11 or 15, and height and width must be equal.
- Height, width, and viewbox must use pixel units.

### For developers

Maki is ready to be used by developers. Install Maki via NPM:

```
npm install maki --save
```

The maki module exports two properties: `dirname` which just points to the directory that contains icons, and then `layouts` which is an object that can be used to organize and display icons in your app or website. Here's an example usage in Node.js:

``` js
var maki = require('maki');

files.forEach(function(fileName, j) {
  maki.layouts.all.forEach(function(icon) {
    fs.readFile(maki.dirname + '/icons/' + icon + '-11.svg', 'utf8', function(err, file) {
      // Read icons as strings in node
      console.log(file);
    });
  });
});

```

### Note about branches

The main branch for the Maki project is `master`. The old version of Maki still exists in the `mb-pages` branch, which must remain intact because a number of old Mapbox projects depend on files it serves from its `www/` directory.
