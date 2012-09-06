(function(context) {
var maki = {};

maki.map = function() {
    var makimap = mapbox.map('map', mapbox.layer().id('saman.map-kg3gj8s6', function(l) {
        var t = l.tilejson();
        t.attribution = 'POI data from <a href="http://downloads.cloudmade.com/americas/northern_america/united_states/district_of_columbia#downloads_breadcrumbs">cloudmade</a> via OpenStreetMap <a href="http://creativecommons.org/licenses/by-sa/2.0">CC BY-SA 2.0</a>';
        l.tilejson(t);
        makimap.ui.refresh();
        makimap.ui.attribution.add();
        makimap.centerzoom({ lat: 38.91710, lon: -77.03024 }, 17).setZoomRange(16, 17);
        makimap.interaction.auto();
        makimap.ui.zoomer.add();
    }));
}();

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
    var template = _.template($('#icon-collection').html());
    var icons = $('#maki-set');
    var search = $('#search');
    var searchResults = _.template($('#search-icons').html());
    var count = _.template($('#count').html());
    var set = {}, total = 0;
    var data;

    $.ajax({
      url: 'www/maki.json',
      dataType: 'json',
      success: function(resp) {
        total = 0;
        data = _(resp).chain()
          .compact()
          .map(function(p) {
              p.words = (p.name.toLowerCase() +' '+ (p.tags.toString()).toLowerCase()).match(/(\w+)/g);
              return p;
          })
          .value();

          _.each(data, function(icon){
            set.title = icon.name;
            set.icon = icon.icon;
            total++
            $('#maki-set').append(template(set));
          });
          howMany();
        }
    });

    var howMany = function() {
      $('.count').append(count({
        setcount: total,
        totalcount: total * 3
      }));
    }
    var find = function(phrase) {
        var matches = _(data).filter(function(p) {
            return _(phrase).filter(function(a) {
                return _(p.words).any(function(b) {
                    return a === b || b.indexOf(a) === 0;
                });
            }).length === phrase.length;
        });
        return matches;
    };

    $('input', search).focus(function() {
        $('.icon.close').addClass('active');
        $('#maki-set').addClass('active');
        $(this).val('');
        icons.animate({
            opacity: 0.10
        }, 400, function() {
            $('body').addClass('searching');
        });
    });

    $('input', search).keyup(_(function() {
        $('#search-results ul').removeClass().empty();
        $('#search-results > div').removeClass('active');

        var done = {};
        var phrase = $('input', search).val();
        if (phrase.length >= 1) {
            var matches = find(phrase.toLowerCase().match(/(\w+)/g));
            var widthClass = _.size(matches);
            _(matches).each(function(p) {
                $('#search-results ul#results')
                  .addClass('active clearfix pad3 size-' + widthClass)
                  .append(searchResults(p));
            });
            if (matches.length) return;
        }
        $('#search-results > div.empty').addClass('active');
        return false;
    }).debounce(100));

    $(document.documentElement).keydown(function (e) {
        if (e.keyCode === 27) { $('a.close').trigger('click'); }
    });

    $('a.close').click(function (e) {
        e.preventDefault();
        icons.stop().animate({
            opacity: 30
        }, 500);
        $('body').removeClass('searching');
        $('input', search).blur().val('');
        $('.icon.close').removeClass('active');
        $('#maki-set').removeClass('active');
    });
};
$(maki.search);

window.maki = maki;
})(window);
