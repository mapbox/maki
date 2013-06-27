#!/bin/bash
set -e -u

# Usage:
# ./render.sh [png|sprite]

function build_pngs {
    outdir=maki-png

    for svg in maki-svg/*-{12,18,24}.svg; do
        inkscape \
            --export-dpi=90 \
            --export-png=$outdir/$(basename $svg .svg).png \
            $svg
        inkscape \
            --export-dpi=180 \
            --export-png=$outdir/$(basename $svg .svg)@2x.png \
            $svg
    done
}

function build_sprites {
    # The `montage` results are weird if the number of images passed in
    # do not grid perfectly, so we calculate the correct number of null
    # images to add into the command.

    tilex=15 # how many icons wide the sprites will be
    count=$(echo maki-png/*-{12,18,24}.png | tr ' ' '\n' | wc -l)
    remainder=$(echo $count \% $tilex | bc)
    rnull=$(for ((i=1; i<=$remainder; i++)); do echo -n 'null: '; done)

    montage \
        -type TrueColorAlpha \
        -background transparent \
        -geometry +0+0 \
        -tile ${tilex}x \
        -gravity Northwest \
        $(echo maki-png/*-{12,18,24}.png | tr ' ' '\n' | sort | tr '\n' ' ') \
        $(echo -n $rnull) \
        www/images/maki-sprite.png

    montage \
        -type TrueColorAlpha \
        -background transparent \
        -geometry +0+0 \
        -tile 15x \
        -gravity Northwest \
        $(echo maki-png/*-{12,18,24}@2x.png | tr ' ' '\n' | sort | tr '\n' ' ') \
        $(echo -n $rnull) \
        www/images/maki-sprite@2x.png
}

function build_all {
    build_pngs
    build_sprites
}

case $@ in
    png | pngs )
        build_pngs
        ;;
    sprite | sprites )
        build_sprites
        ;;
    * )
        build_all
        ;;
esac
