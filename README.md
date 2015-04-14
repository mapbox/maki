# NPMaki

[![Build Status](https://travis-ci.org/nationalparkservice/npmaki.png)](https://travis-ci.org/nationalparkservice/npmaki)

NPMaki is a forked version of Maki - a point of interest icon set designed and maintained by [Mapbox](https://www.mapbox.com]. NPMaki, however, uses an optimized version of the National Park Service's [symbolset](http://www.nps.gov/hfc/carto/map-symbols.cfm) in place of Mapbox's symbols.

## src

NPMaki's source [SVG][] files are in the `src` subdirectory. To create pixel-perfect icons at different sizes, each icon is designed 3 times for 12, 18, and 24 pixels wide/tall.

## renders

PNG renders of all of the SVGs are in the `renders` directory. High-resolution (aka Retina) versions of each icon are present as well, named using the common `@2x` convention.

## render.sh

You can use the SVGs and PNGs in this repository as they are without building anything, however a render script is included to assist designers/developers who want to modify or create NPMaki icons. It will render SVGs to PNGs at 100% and 200% resolution, create sprites used by [NPMap.js](https://github.com/nationalparkservice/npmap.js), [NPMap Builder](https://github.com/nationalparkservice/npmap-builder], and the [Places Editor](https://github.com/nationalparkservice/places-editor) and generate corresponding CSS styles for the sprites.

The script requires [Bash][http://www.gnu.org/software/bash/bash.html], [Inkscape][http://inkscape.org], and [ImageMagick][http://www.imagemagick.org/] to function correctly. Each icon must have an appropriate entry in `www/npmaki.json` to be rendered correctly.

[SVG]: http://en.wikipedia.org/wiki/Scalable_Vector_Graphics
[Inkscape]: http://inkscape.org
[Bash]: http://www.gnu.org/software/bash/bash.html
[ImageMagick]: http://www.imagemagick.org/

You can run the script like this:

    cd npmaki
    bash render.sh

## Versioning

NPMaki uses a semantic versioning scheme.

* 0.0.z: bugfixes, modifications
* 0.y.0: icons added
* x.0.0: icons removed, sprite scheme changed, or major features added
