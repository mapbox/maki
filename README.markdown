# Maki

[![Build Status](https://travis-ci.org/mapbox/maki.png)](https://travis-ci.org/mapbox/maki)

Maki is a point of interest icon set made especially for use with Mapbox maps. For more information on how to use Maki with Mapbox, see documentation at http://mapbox.com/tilemill/docs/guides/using-maki-icons/.

## src

Maki's source [SVG][] files are in the `src` subdirectory. To create pixel-perfect icons at different sizes, each icon is designed 3 times for 12, 18, and 24 pixels wide/tall.

Maki is designed using [Inkscape][]. For information on contributing to Maki see CONTRIBUTING.md.

## renders

PNG renders of all of the SVGs are in the `renders` directory. High-resolution (aka Retina) versions of each icon are present as well, named using the common `@2x` convention.

## ArcGIS

Style files for ArcGIS 10.1+ are in the `ArcGIS` subdirectory and are maintained by @williamscraigm. Both Desktop (.style) and Server (.ServerStyle) versions are provided. Standard and high-resolution versions of the PNG renders are included in the style.  Additionally, the original SVGs have been converted to EMFs and import as vector EMF based markers. These EMF markers were then further converted to Representation markers. The utility used to create these styles can be found at: https://github.com/williamscraigm/makiArcGISStyle

## render.sh

You can use the SVGs and PNGs in this repository as they are without building anything, however a render script is included to assist designers/developers who want to modify or create Maki icons. It will render SVGs to PNGs at 100% and 200% resolution.

The script requires [Bash][], [Inkscape][], and [ImageMagick][] to function correctly. Each icon must have an appropriate entry in `www/maki.json` to be rendered correctly.

[SVG]: http://en.wikipedia.org/wiki/Scalable_Vector_Graphics
[Inkscape]: http://inkscape.org
[Bash]: http://www.gnu.org/software/bash/bash.html
[ImageMagick]: http://www.imagemagick.org/

## Versioning

Maki uses a semantic versioning scheme.

* 0.0.z: bugfixes, modifications
* 0.y.0: icons added
* x.0.0: icons removed, sprite scheme changed, or major features added

