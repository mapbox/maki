# Contributing to Maki

Maki source files are in SVG format in the `src` subdirectory and are created using [Inkscape][].

## Design principles

Maki follows these design principles:

- Simple, clear, recognizable
- Three sizes: 12/18/24 px
- Single color, with 1px 30% transparent white outline.
- Based upon internationally recognized symbols when appropriate. Good sources for symbol precedents include [AIGA symbols](http://www.aiga.org/symbol-signs/), OSM's icon set [SBBJ SVG Map Icons](http://www.sjjb.co.uk/mapicons/contactsheet) and the [Noun Project](http://thenounproject.com/).

## Icon Backlog

To view the backlog of icons that need to be created, visit https://github.com/mapbox/maki/wiki/Maki-Backlog

## New icon process

1. Create copies of the template SVGs in the `src` directory (`maki-12-base.svg`, `maki-18-base.svg`, `maki-24-base.svg`) with a short descriptive name following the conventions of the other icons.
2. Design according to the principles outlined above.
3. You'll want to remove personal information from your SVG files if you're committing or submitting a pull request:
    - Mac OS X: `sed -i "" -e 's/\ *inkscape:export-filename=".*"//g' your-icon-{12,18,24}.svg`
    - Linux: `sed -i 's/\ *inkscape:export-filename=".*"//g' your-icon-{12,18,24}.svg`
4. Add an appropriate entry to `www/maki.json`
5. Edit `www/maki.json` and create a new object with:
    - the icon name
    - the icon filename
    - tags to describe the icon
6. Run `render.sh` to generate the PNGs, sprites, and CSS

Please limit new icon pull requests to one icon each (ie one set of 12, 18, and 24 pixel SVGs) unless they are very closely related in concept and design.
