# Maki 

Maki is a point of interest icon set made especially for use with MapBox maps. For more information on how to use Maki with MapBox, see documentation at http://mapbox.com/tilemill/docs/guides/using-maki-icons/.


## Notes on Contributing

I recommend using [Inkscape](http://inkscape.org/) for editing and exporting from the .SVG to take advantage of Inkscape's batch export, as all the icons have unique ID's that Inkscape uses to create file names. 

Maki follows these design principles:

- Simple, clear, recognizable
- Three sizes: 12/18/24 px
- Single color, with 1px 30% transparent white outline.
- Based upon internationally recognized symbols when appropriate. Good sources for symbol precedents include [AIGA symbols](http://www.aiga.org/symbol-signs/), OSM's icon set [SBBJ SVG Map Icons](http://www.sjjb.co.uk/mapicons/contactsheet) and the [Noun Project](http://thenounproject.com/).

To view the backlog of icons that need to be created, visit https://github.com/mapbox/maki/wiki/Maki-Backlog

If you decide to modify `src/maki-icons.svg` in order to add an icon to the set, before submitting a pull request, make sure you clear user-specific settings from the SVG with: `sed -i 's/\ *inkscape:export-filename=".*"//g' maki-icons.svg` on Linux or `sed -i "" -e 's/\ *inkscape:export-filename=".*"//g' maki-icons.svg` on OSX.

It isn't necessary, but if you want to be an over-acheiver, you can also update the website with your new icon by [following these instructions](https://github.com/mapbox/maki/wiki/Adding-icons-to-the-site)
## Completed icons

### Basic shapes

- solid circle
- stroked circle
- solid square
- stroked square
- solid triangle
- stroked triangle
- solid star
- stroked star
- solid 'x'
- stroked 'x'
- solid marker
- stroked marker

### Social
- amenity='college'
- amenity='library'
- amenity='school'
- amenity='hospital'
- amenity='pharmacy'
- amenity='grave_yard'
- amenity='place_of_worship' religion='christian'
- amenity='place_of_worship' religion='hindu'
- amenity='place_of_worship' religion='jewish'
- amenity='place_of_worship' religion='muslim'

### Public
- amenity='fire_station'
- amenity='prison'
- amenity='post_office'
- amenity='police'   
- amenity='townhall'
- amenity='embassy'

### Transportation
- amenity='bicycle_rental'  
- parking lot (international)
- parking garage
- aeroway='helipad'
- aeroway='aerodrome'
- amenity='fuel'
- Bicycle
- Ferry
- Harbor

### Commercial
- amenity='bar'
- amenity='restaurant'
- amenity='fast_food' 
- amenity='cafe'
- shop
- grocery store
- movie theatre
- amenity='bank' (international)
- amenity='cinema'
- amenity='pub'   

### Recreation
- tourism='museum'
- amenity='arts_centre'
- amenity='theatre'
- tourism='hotel'
- tourism='zoo'
- leisure='park'
- campsite
- garden
- leisure='pitch' (a general sports icon)
    - sport='american_football'
    - sport='soccer'
    - sport='tennis'
    - sport='baseball'
    - sport='swimming'
    - sport='skiing'
    - sport='golf'
    - sport='cricket'
    - sport='basketball'
- historic='monument'

### Disaster / Emergency

- danger

### Natural

- Water
- Wetland
