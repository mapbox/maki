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

    m.setCenterZoom(new mm.Location(38.91710,-77.03024), 17);
    wax.mm.zoomer(m).appendTo(m.parent);
    wax.mm.interaction(m);
});

$(function () {
    $('#maki-icon-preview').find('a').click(function (e) {
        e.preventDefault();
        var activeLink = $(this).attr('id');
        $('#maki-icon-preview').find('a.active').removeClass('active');
        $('#maki-icon-preview').find('img.active').fadeOut('fast', function () {
            $('#maki-icon-preview').find('img.active').removeClass('active');
            $('#maki-icon-preview').find('img.' + activeLink).addClass('active').fadeIn('fast');
        });
        $('#arrow').removeClass().addClass(activeLink);
        $(this).addClass('active');
    });
});
