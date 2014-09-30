#!/bin/bash
set -e -u

# Usage:
#   ./render.sh [png|sprite|css|csv]

# Config
tilex=15  # how many icons wide the sprites will be
svgdir="src"  # SVGs should already be here
pngdir="renders"  # PNGs will be created, possibly overwritten, here


function build_pngs {
    # Takes a list of SVG files and renders both 1x and 2x scale PNGs

    for svg in $@; do

        icon=$(basename $svg .svg)

        inkscape \
            --export-dpi=90 \
            --export-png=${pngdir}/${icon}.png \
            $svg > /dev/null

        inkscape \
            --export-dpi=180 \
            --export-png=${pngdir}/${icon}@2x.png \
            $svg > /dev/null
    done
}


function build_csv {
    # Outputs a simple CSV that can be used in Mapnik/TileMill/etc to
    # test all of the icons on a map. Example CartoCSS:
    #     marker-file: url("/path/to/maki/src/[icon]-[size].svg");
    #     marker-allow-overlap: true;

    count=-179
    echo "icon,size,x,y" > maki.csv
    for icon in $@; do
        echo $icon,12,$count,1 >> maki.csv
        echo $icon,18,$count,2 >> maki.csv
        echo $icon,24,$count,3 >> maki.csv
        count=$(($count+1))
    done
}


# Get a list of all the icon names - any icons not in maki.json
# will not be rendered or included in the sprites.
icons=$(grep '"icon":' www/maki.json \
    | sed 's/.*\:\ "\([-a-z0-9]*\)".*/\1/' \
    | tr '\n' ' ')

# Build lists of all the SVG and PNG files from the icons list
svgs=$(for icon in $icons; do echo -n $svgdir/${icon}-{24,18,12}.svg" "; done)
pngs=$(for icon in $icons; do echo -n $pngdir/${icon}-{24,18,12}.png" "; done)
pngs2x=$(for icon in $icons; do echo -n $pngdir/${icon}-{24,18,12}@2x.png" "; done)

case $@ in
    png | pngs )
        build_pngs $svgs
        ;;
    csv )
        build_csv $icons
        ;;
    debug )
        # Prints out all of the icon and file lists for debugging
        echo -e "\nIcons:"
        echo $icons
        echo -e "\nSVGs:"
        echo $svgs
        echo -e "\nPNGs:"
        echo $pngs
        echo -e "\nPNGs @2x:"
        echo $pngs2x
        ;;
    * )
        # By default we build the PNGs, but not the CSV or debug output
        build_pngs $svgs
        ;;
esac
