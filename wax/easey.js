(function(context, MM) {
    var easey = {},
        running = false,
        abort = false; // killswitch for transitions

    var easings = {
        easeIn: function(t) { return t * t; },
        easeOut: function(t) { return Math.sin(t * Math.PI / 2); },
        linear: function(t) { return t; }
    };

    // From the implementation in Modest Maps by Tom Carden
    // From "Smooth and efficient zooming and panning"
    // by Jarke J. van Wijk and Wim A.A. Nuij
    //
    // You only need to understand section 3 (equations 1 through 5)
    // and then you can skip to equation 9, implemented below:
    function sq(n) {
        return Math.pow(n, 2);
    }

    function cosh(x) {
        return (Math.pow(Math.E,x) + Math.pow(Math.E,-x)) / 2;
    }
    function sinh(x) {
        return (Math.pow(Math.E,x) - Math.pow(Math.E,-x)) / 2;
    }
    function tanh(x) {
        return sinh(x) / cosh(x);
    }

    // Interpolate two xy coordinates, the usual way.
    function interpolateXY(a, b, p) {
        function interpolate1(a, b, p) {
            return a + ((b-a) * p);
        }
        return {
            x: interpolate1(a.x, b.x, p),
            y: interpolate1(a.y, b.y, p)
        };
    }

    // give this a b(0) or b(1)
    function r(b) {
        return Math.log(-b + Math.sqrt(sq(b) + 1));
    }

    function animateStep(c0,w0,c1,w1,V,rho) {

        // see section 6 for user testing to derive these values (they can be tuned)
        if (V === undefined) V = 0.9;      // section 6 suggests 0.9
        if (rho === undefined) rho = 1.42; // section 6 suggests 1.42

        // simple interpolation of positions will be fine:
        var u0 = 0,
            u1 = MM.point.distance(c0, c1);

        // i = 0 or 1
        function b(i) {
            var n = sq(w1) - sq(w0) + ((i ? -1 : 1) *
                Math.pow(rho, 4) * sq(u1 - u0));
            var d = 2 * (i ? w1 : w0) * sq(rho) * (u1-u0);
            return n / d;
        }

        var r0 = r(b(0)),
            r1 = r(b(1)),
            S = (r1-r0) / rho; // "distance"

        function u(s) {
            var a = w0/sq(rho),
            b = a * cosh(r0) * tanh(rho*s + r0),
            c = a * sinh(r0);
            return b - c + u0;
        }

        function w(s) {
            return w0 * cosh(r0) / cosh(rho*s + r0);
        }

        // special case
        if (Math.abs(u0 - u1) < 0.000001) {
            if (Math.abs(w0 - w1) < 0.000001) return;

            var k = w1 < w0 ? -1 : 1;
            S = Math.abs(Math.log(w1/w0)) / rho;

            u = function(s) {
                return u0;
            };
            w = function(s) {
                return w0 * Math.exp(k * rho * s);
            };
        }

        var t0 = +new Date();
        function tick() {
            var t1 = +new Date(),
                t = (t1 - t0) / 1000.0,
                s = V * t;
            if (s > S) {
                s = S;
            } else {
                MM.getFrame(tick);
            }
            var us = u(s);
            var pos = interpolateXY(c0, c1, (us - u0) / (u1 - u0));
            applyPos(pos, w(s));
        }
        MM.getFrame(tick);
    }

    easey.cancel = function() { abort = true; };

    easey.sequence = function(map, steps) {
        for (var i = 0; i < (steps.length - 1); i++) {
            var c = steps[i].callback || function() {};
            steps[i].callback = (function(j, ca) {
                return function() {
                    if (ca) ca();
                    easey.slow(map, steps[j]);
                };
            })(i + 1, c);
        }
        return easey.slow(map, steps[0]);
    };

    easey.running = function() {
        return running;
    }

    easey.set = function(o) {
        if (o.z) z = o.z;
        if (o.time) time = o.time;
        return running;
    };

    // Basic layout:
    // if you just provide data, easey
    // will assume
    //
    //   smooth: true,
    //   greatcircle: true
    //
    easey.slow = function(map, options) {
        var start = (+new Date()),
            startZoom = map.getZoom(),
            startCenter = map.getCenter(),
            startCoordinate = map.coordinate.copy();

        running = true;

        // Easy-mode options. These preclude setting
        // any other options.
        if (typeof options === 'number') {
            options = { zoom: options };
        } else if (options.lat && typeof options.lat === 'number') {
            options = { location: options };
        } else if (options.x && typeof options.x === 'number') {
            options = { coordinate: map.pointCoordinate(options) };
        }

        if (options.point) {
            options.coordinate = map.pointCoordinate(options.point);
        } else if (options.about) {
            options.about_location = map.pointLocation(options.about);
        }

        z = options.zoom || startZoom;
        time = options.time || 1000;
        callback = options.callback || function() {};
        ease = easings[options.ease] || easings.easeOut;

        function tick() {
            var delta = (+new Date()) - start;
            if (abort) {
                return void (abort = running = false);
            } else if (delta > time) {
                running = false;
                map.setZoom(z);
                return callback();
            } else {
                MM.getFrame(tick);
            }

            var t = ease(delta / time);
            var tz = (z == startZoom) ? z : (startZoom * (1 - t) + z * t);
            if (options.location) {
                map.setCenterZoom(MM.Location.interpolate(
                    startCenter,
                    options.location, t),
                    tz);
            } else if (options.coordinate) {
                var a = startCoordinate.copy().zoomTo(tz);
                var b = options.coordinate.copy().zoomTo(tz);
                map.coordinate = new MM.Coordinate(
                    (a.row * (1 - t)) +    (b.row * t),
                    (a.column * (1 - t)) + (b.column * t),
                    tz);
            } else if (options.about) {
                map.coordinate = map.coordinate.zoomTo(tz);
                var np = map.locationPoint(options.about_location);
                map.panBy(options.about.x - np.x, options.about.y - np.y);
            }
            map.draw();
        }

        MM.getFrame(tick);
    };

    this.easey = easey;
})(this, com.modestmaps);
