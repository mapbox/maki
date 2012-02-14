var mm = com.modestmaps;
var url = 'http://api.tiles.mapbox.com/v3/saman.map-kg3gj8s6.jsonp';

wax.tilejson(url, function(tilejson) {
    tilejson.minzoom = 16;
    tilejson.maxzoom = 18;
    var m = new mm.Map('map',
        new wax.mm.connector(tilejson), null, [
            new mm.MouseHandler(),
            new mm.TouchHandler()
        ]
    );

    m.setCenterZoom(new mm.Location(38.91730,-77.03024), 17);
    wax.mm.zoomer(m).appendTo(m.parent);
    wax.mm.interaction(m);
});
