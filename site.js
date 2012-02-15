(function(context) {
var maki = {};

maki.map = function() {
    var mm = com.modestmaps;
    var url = 'http://api.tiles.mapbox.com/v3/saman.map-kg3gj8s6.jsonp';

    wax.tilejson(url, function(tilejson) {
        tilejson.minzoom = 16;
        tilejson.maxzoom = 18;
        var m = new mm.Map('map',
            new wax.mm.connector(tilejson), null, [
                new mm.DragHandler(),
                new mm.TouchHandler()
            ]
        );

        m.setCenterZoom(new mm.Location(38.91710,-77.03024), 17);
        wax.mm.zoomer(m).appendTo($('#controls')[0]);
        wax.mm.interaction(m);
    });
};
$(maki.map);

maki.slideshow = function() {
    $('#maki-icon-preview').find('a').click(function (e) {
        e.preventDefault();
        if (!$(this).hasClass('active')) {
            var activeLink = $(this).attr('href').split('#').pop();
            $('#maki-icon-preview').find('a.active').removeClass('active');
            $('#maki-icon-preview').find('img.active').fadeOut(100, function () {
                $('#maki-icon-preview').find('img.active').removeClass('active');
                $('#maki-icon-preview').find('img.' + activeLink).addClass('active').fadeIn('fast');
            });
            $('#arrow').removeClass().addClass(activeLink);
            $(this).addClass('active');
        }
    });
};
$(maki.slideshow);

maki.search = function () {
    // Handle geocoder form submission
    var input = $('.canvas-controls').find('input');
    var icons = $('.maki-set');


    input.focus(function() {
        icons.stop().animate({
            opacity: 0.35
        }, 500);
    });

    input.blur(function() {
        icons.stop().animate({
            opacity: 100
        }, 500);
    });
};
$(maki.search);

window.maki = maki;
})(window);
