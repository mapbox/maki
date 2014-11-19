#!/bin/bash
set -e -u

# Usage:
#   ./render.sh [png|sprite|css|csv|sdf]

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


function build_sprite {
    # Takes a list of PNG files and creates a sprite file

    # The `montage` results are weird if the number of images passed in
    # do not grid perfectly, so we calculate the correct number of null
    # images to add into the command.

    outfile=$1
    shift   # the rest of the arguments should be filenames

    count=$(echo $@ | tr ' ' '\n' | wc -l)
    remainder=$(($count % $tilex))
    rnull=$(for ((i=1; i<=$remainder; i++)); do echo -n 'null: '; done)

    montage \
        -type TrueColorMatte \
        -background transparent \
        -geometry +0+0 \
        -tile ${tilex}x \
        -gravity Northwest \
        $@ $rnull \
        $outfile

    # Create a negated 'dark' appropriate version of the sprite.
    convert $outfile -negate $(echo "$outfile" | sed 's/-sprite/-sprite.dark/')
}

function build_css {
    # Takes a list of icon names, calculates the correct CSS background-
    # positions for 24px icons, and creates an appropriate CSS file.
    # Assumes that the icon list matches what was passed to the last run
    # of the build_pngs function.

    count=0
    dx=0
    dy=0
    maxwidth=$((54*$tilex/3-1))

    cat www/maki-sprite.css.tpl > www/maki-sprite.css

    for icon in $@; do

        count=$(($count + 1))


        echo ".maki-icon.$icon { background-position: ${dx}px ${dy}px; }" \
            >> www/maki-sprite.css

        # Check if we need to add a new row yet,
        # and if so, adjust dy and dy accordingly.
        # Otherwise just adjust dx.
        if [ $(($count * 3 % $tilex)) -eq 0 ]; then
            dy=$(($dy - 24))
            dx=0
        else
            dx=$(($dx - 54))
        fi
    done

    # Update sprite dimensions for retina rules.
    dim="$(identify -format "%wpx %hpx" www/images/maki-sprite.png)"
    cat www/maki-sprite.css | sed "s/background-size: [0-9]*px [0-9]*px;/background-size: $dim;/" > www/maki-sprite.css.tmp
    mv www/maki-sprite.css.tmp www/maki-sprite.css
}

function build_positions {
    # Takes a list of icon names, calculates the positions, outputs json

    count=0
    dx=0
    dy=0
    maxwidth=$((54*$tilex/3-1))

    file="www/maki-sprite.json"

    echo "{" > $file;

    for icon in $@; do

        if [ $count -ne 0 ]; then  ## avoid trailing comma
            echo "," >> $file
        fi

        count=$(($count + 1))

        echo "\"$icon-24\": { \"x\": $((-1 * dx)), \"y\": $((-1 * $dy)), \"width\": 24, \"height\": 24 }," >> $file
        echo "\"$icon-18\": { \"x\": $((-1 * dx + 24)), \"y\": $((-1 * $dy)), \"width\": 18, \"height\": 18 }," >> $file
        echo -n "\"$icon-12\": { \"x\": $((-1 * dx + 42)), \"y\": $((-1 * $dy)), \"width\": 12, \"height\": 12 }" >> $file

        # Check if we need to add a new row yet,
        # and if so, adjust dy and dy accordingly.
        # Otherwise just adjust dx.
        if [ $(($count * 3 % $tilex)) -eq 0 ]; then
            dy=$(($dy - 24))
            dx=0
        else
            dx=$(($dx - 54))
        fi
    done

    echo "}" >> $file
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

function build_sdf {
    node sdf-render.js
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
    sprite | sprites )
        build_sprite "www/images/maki-sprite.png" $pngs
        build_sprite "www/images/maki-sprite@2x.png" $pngs2x
        ;;
    css )
        build_css $icons
        ;;
    csv )
        build_csv $icons
        ;;
    sdf )
        build_sdf
        ;;
    positions )
        build_positions $icons
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
        # By default we build the PNGs, sprites, CSS, and position JSON
        # but not the CSV or debug output
        build_pngs $svgs
        build_sprite "www/images/maki-sprite.png" $pngs
        build_sprite "www/images/maki-sprite@2x.png" $pngs2x
        build_css $icons
        build_positions $icons
        build_sdf
        ;;
esac
