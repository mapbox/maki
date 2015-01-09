# New icon requests

New icons may be requested via GitHub issues. Please search through [existing issue](https://github.com/mapbox/maki/issues?state=open) and the [backlog in the wiki](https://github.com/mapbox/maki/wiki/Maki-Backlog) to check that your request is not already covered. Please also limit issues to a **single** icon or a small set of **very closely related** icons so they can be more easily fulfilled and closed.

# Contributing to Maki

Maki source files are in SVG format in the `src` subdirectory and are created using [Inkscape](http://inkscape.org).

## Design principles

Maki follows these design principles:

- Simple, clear, recognizable
- Three sizes: 12/18/24 px
- Aligned on the pixel grid.
- Single color, with 1px 30% transparent white outline.
- Based upon internationally recognized symbols when appropriate. Good sources for symbol precedents include [AIGA symbols](http://www.aiga.org/symbol-signs/), OSM's icon set [SBBJ SVG Map Icons](http://www.sjjb.co.uk/mapicons/contactsheet) and the [Noun Project](http://thenounproject.com/).

## Icon Backlog

To view the backlog of icons that need to be created, visit https://github.com/mapbox/maki/wiki/Maki-Backlog

## Adding a new icon

1. Create copies of the template SVGs in the `src` directory (`maki-12-base.svg`, `maki-18-base.svg`, `maki-24-base.svg`) with a short descriptive name following the conventions of the other icons.
2. Design according to the principles outlined above.
3. Export the icon as a *plain* SVG to avoid including unneeded information in the file.
4. Make sure the canvas `<rect>` style contains `visibility:hidden` - Inkscape may remove this.
5. Edit `www/maki.json` and create a new object with:
    - the icon name
    - the icon filename
    - tags to describe the icon
6. Run `dev-render.sh` to generate the PNGs, plus sprites, and CSS for the maki website. The script requires [Bash][], [Inkscape][], and [ImageMagick][] to function correctly. Each icon must have an appropriate entry in `www/maki.json` to be rendered correctly.

[SVG]: http://en.wikipedia.org/wiki/Scalable_Vector_Graphics
[Inkscape]: http://inkscape.org
[Bash]: http://www.gnu.org/software/bash/bash.html
[ImageMagick]: http://www.imagemagick.org/


Please limit new icon pull requests to one icon each (ie one set of 12, 18, and 24 pixel SVGs) unless they are very closely related in concept and design.
