[![Circle CI](https://circleci.com/gh/mapbox/maki-2.svg?style=svg)](https://circleci.com/gh/mapbox/maki-2)

# Maki

A pixel-aligned point of interest icon set made for cartographers.

This repo only contains the source SVG files. Check out [maki website](https://mapbox.com/maki-icons/) to use an icon editing tool and read detailed design guidelines.

### Format

- Source icons are in the SVG file format.
- Icons are available in two sizes: 11px x 11px and 15px x 15px.
- Icons are each a single unified SVG path, with no transforms, groups or strokes.

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

The main branch for the Maki project is `master`, however any icon contribution work should branch off of the development branch. The old version of Maki still exists in the `mb-pages` branch, which must remain intact because a number of old Mapbox projects depend on files it serves from its `www/` directory.

### Icon Requests & Contributing

Maki welcomes icon requests from people in need of points of interest icons. Open an issue to make a request, and make sure to provide the required information outlined in the issue template.

Maki also welcomes contributions from designers who need icons for specific points of interest. Check out the [design guidelines](https://www.mapbox.com/maki-icons/guidelines/) before opening an issue.

### Workflow

For both icon requests and contributions, please follow this [workflow sequenence](https://gist.github.com/natslaughter/faafd62bdc43a31e57801165ba8fc4d3).

