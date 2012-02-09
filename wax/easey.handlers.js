(function(context, MM) {

    easey.TouchHandler = function(map, options) {
        if (map) {
            this.init(map, options);
        }
    };

    easey.TouchHandler.prototype = {

      init: function(map, options) {
            var prevT = 0,
                acceleration = 25.0,
                speed = null,
                maxTapTime = 250,
                maxTapDistance = 30,
                maxDoubleTapDelay = 350,
                drag = 0.10,
                locations = {},
                taps = [],
                wasPinching = false,
                nowPoint = null,
                oldPoint = null,
                lastMove = null,
                lastPinchCenter = null;

            options = options || {};

            function animate(t) {
                var dir = { x: 0, y: 0 };
                var dt = Math.max(0.001,(t - prevT) / 1000.0);
                if (nowPoint && oldPoint &&
                    (lastMove > (+new Date() - 50))) {
                    dir.x = nowPoint.x - oldPoint.x;
                    dir.y = nowPoint.y - oldPoint.y;
                    speed.x = dir.x;
                    speed.y = dir.y;
                } else {
                    speed.x -= speed.x * drag;
                    speed.y -= speed.y * drag;
                    if (Math.abs(speed.x) < 0.001) {
                        speed.x = 0;
                    }
                    if (Math.abs(speed.y) < 0.001) {
                        speed.y = 0;
                    }
                }
                if (speed.x || speed.y) {
                    map.panBy(speed.x, speed.y);
                }
                prevT = t;
                // tick every frame for time-based anim accuracy
                MM.getFrame(animate);
            }


            // Test whether touches are from the same source -
            // whether this is the same touchmove event.
            function sameTouch (event, touch) {
                return (event && event.touch) &&
                    (touch.identifier == event.touch.identifier);
            }

            
            function updateTouches (e) {
                for (var i = 0; i < e.touches.length; i += 1) {
                    var t = e.touches[i];
                    if (t.identifier in locations) {
                        var l = locations[t.identifier];
                        l.x = t.screenX;
                        l.y = t.screenY;
                        l.scale = e.scale;
                    }
                    else {
                        locations[t.identifier] = {
                            scale: e.scale,
                            startPos: { x: t.screenX, y: t.screenY },
                            x: t.screenX,
                            y: t.screenY,
                            time: new Date().getTime()
                        };
                    }
                }
            }

            function touchStartMachine(e) {
                updateTouches(e);
                return MM.cancelEvent(e);
            }

            function touchMoveMachine(e) {
                switch (e.touches.length) {
                    case 1:
                        onPanning(e.touches[0]);
                        break;
                    case 2:
                        onPinching(e);
                        break;
                }
                updateTouches(e);
                return MM.cancelEvent(e);
            }

            // Fail early if this isn't a touch device.
            // TODO: move to add fn
            if (!isTouchable()) return false;

            MM.addEvent(map.parent, 'touchstart',
                touchStartMachine);
            MM.addEvent(map.parent, 'touchmove',
                touchMoveMachine);
            MM.addEvent(map.parent, 'touchend',
                touchEndMachine);

            options = {};
            options.snapToZoom = options.snapToZoom || true;

            prevT = new Date().getTime();
            speed = { x: 0, y: 0 };
            MM.getFrame(animate);
            
            // Handle a tap event - mainly watch for a doubleTap
            function onTap(tap) {
                if (taps.length &&
                    (tap.time - taps[0].time) < maxDoubleTapDelay) {
                    onDoubleTap(tap);
                    taps = [];
                    return;
                }
                taps = [tap];
            }

            // Handle a double tap by zooming in a single zoom level to a
            // round zoom.
            function onDoubleTap(tap) {
                // zoom in to a round number
                easey.slow(map, {
                    zoom: Math.round(map.getZoom()) + 1,
                    about: new MM.Point(tap.x, tap.y),
                    time: 100
                });
            }

            function isTouchable () {
                 var el = document.createElement('div');
                 el.setAttribute('ongesturestart', 'return;');
                 return (typeof el.ongesturestart === 'function');
            }

            function remove() {
                // Fail early if this isn't a touch device.
                if (!isTouchable()) return false;

                MM.removeEvent(map.parent, 'touchstart',
                    touchStartMachine);
                MM.removeEvent(map.parent, 'touchmove',
                    touchMoveMachine);
                MM.removeEvent(map.parent, 'touchend',
                    touchEndMachine);
            }

            
            // Re-transform the actual map parent's CSS transformation
            function onPanning(touch) {
                lastMove = +new Date();
                oldPoint = nowPoint;
                nowPoint = { x: touch.screenX, y: touch.screenY };
                // oldPoint = locations[touch.identifier];
            }

            function onPinching(e) {
                // use the first two touches and their previous positions
                var t0 = e.touches[0],
                    t1 = e.touches[1],
                    p0 = new MM.Point(t0.screenX, t0.screenY),
                    p1 = new MM.Point(t1.screenX, t1.screenY),
                    l0 = locations[t0.identifier],
                    l1 = locations[t1.identifier];

                // mark these touches so they aren't used as taps/holds
                l0.wasPinch = true;
                l1.wasPinch = true;

                // scale about the center of these touches
                var center = MM.Point.interpolate(p0, p1, 0.5);

                map.zoomByAbout(
                    Math.log(e.scale) / Math.LN2 -
                    Math.log(l0.scale) / Math.LN2,
                    center);

                // pan from the previous center of these touches
                var prevCenter = MM.Point.interpolate(l0, l1, 0.5);

                map.panBy(center.x - prevCenter.x,
                               center.y - prevCenter.y);
                wasPinching = true;
                lastPinchCenter = center;
            }

            // When a pinch event ends, round the zoom of the map.
            function onPinched(p) {
                // TODO: easing
                if (options.snapToZoom) {
                    var z = map.getZoom(), // current zoom
                        tz = Math.round(z);     // target zoom
                    map.zoomByAbout(tz - z, p);
                }
                wasPinching = false;
            }

            function touchEndMachine(e) {
                var now = new Date().getTime();
                // round zoom if we're done pinching
                if (e.touches.length === 0 && wasPinching) {
                    onPinched(lastPinchCenter);
                }

                oldPoint = nowPoint = null;

                // Look at each changed touch in turn.
                for (var i = 0; i < e.changedTouches.length; i += 1) {
                    var t = e.changedTouches[i],
                        loc = locations[t.identifier];
                    // if we didn't see this one (bug?)
                    // or if it was consumed by pinching already
                    // just skip to the next one
                    if (!loc || loc.wasPinch) {
                        continue;
                    }

                    // we now know we have an event object and a
                    // matching touch that's just ended. Let's see
                    // what kind of event it is based on how long it
                    // lasted and how far it moved.
                    var pos = { x: t.screenX, y: t.screenY },
                        time = now - loc.time,
                        travel = MM.Point.distance(pos, loc.startPos);
                    if (travel > maxTapDistance) {
                        // we will to assume that the drag has been handled separately
                    } else if (time > maxTapTime) {
                        // close in space, but not in time: a hold
                        pos.end = now;
                        pos.duration = time;
                        onHold(pos);
                    } else {
                        // close in both time and space: a tap
                        pos.time = now;
                        onTap(pos);
                    }
                }

                // Weird, sometimes an end event doesn't get thrown
                // for a touch that nevertheless has disappeared.
                // Still, this will eventually catch those ids:

                var validTouchIds = {};
                for (var j = 0; j < e.touches.length; j++) {
                    validTouchIds[e.touches[j].identifier] = true;
                }
                for (var id in locations) {
                    if (!(id in validTouchIds)) {
                        delete validTouchIds[id];
                    }
                }

                return MM.cancelEvent(e);
            }
        }
    };



    // Handle double clicks, that zoom the map in one zoom level.
    easey.DoubleClickHandler = function(map) {
        if (map !== undefined) {
            this.init(map);
        }
    };

    easey.DoubleClickHandler.prototype = {

        init: function(map) {
            this.map = map;
            MM.addEvent(map.parent, 'dblclick', this.getDoubleClick());
        },

        doubleClickHandler: null,

        getDoubleClick: function() {

            // Ensure that this handler is attached once.
            if (!this.doubleClickHandler) {
                var theHandler = this;
                this.doubleClickHandler = function(e) {
                    var map = theHandler.map,
                    point = MM.getMousePoint(e, map),
                    z = map.getZoom() + (e.shiftKey ? -1 : 1);

                    easey.slow(map, {
                        zoom: z,
                        about: point,
                        time: 100
                    });

                    return MM.cancelEvent(e);
                };
            }
            return this.doubleClickHandler;
        }
    };

    // A handler that allows mouse-wheel zooming - zooming in
    // when page would scroll up, and out when the page would scroll down.
    easey.MouseWheelHandler = function(map) {
        if (map !== undefined) {
            this.init(map);
        }
    };

    easey.MouseWheelHandler.prototype = {

        init: function(map) {
            this.map = map;
            MM.addEvent(map.parent, 'mousewheel', this.getMouseWheel());
        },

        mouseWheelHandler: null,

        getMouseWheel: function() {
            // Ensure that this handler is attached once.
            if (!this.mouseWheelHandler) {
                var theHandler = this;
                var prevTime = new Date().getTime();
                this.mouseWheelHandler = function(e) {

                    var delta = 0;
                    if (e.wheelDelta) {
                        delta = e.wheelDelta;
                    } else if (e.detail) {
                        delta = -e.detail;
                    }

                    var timeSince = new Date().getTime() - prevTime;

                    if (Math.abs(delta) > 0 && (timeSince > 50)) {

                        if (easey.running()) {
                          easey.set({
                            time:200,
                            zoom:z + (delta > 0 ? 1 : -1)
                          });
                        } else {
                          var map = theHandler.map,
                          point = MM.getMousePoint(e, map),
                          z = map.getZoom();
                          easey.slow(map, {
                              zoom: z + (delta > 0 ? 1 : -1),
                              about: point,
                              ease: 'linear',
                              time:200
                          });
                        }

                        prevTime = new Date().getTime();
                    }

                    // Cancel the event so that the page doesn't scroll
                    return MM.cancelEvent(e);
                };
            }
            return this.mouseWheelHandler;
        }
    };

    easey.DragHandler = function() { };

    easey.DragHandler.prototype = {
        init: function(map) {
            var prevT = 0,
                acceleration = 25.0,
                speed = null,
                drag = 0.10,
                lastMove = null,
                mouseDownPoint = null,
                mousePoint = null,
                mouseDownTime = 0;

            function mouseDown(e) {
                mousePoint = prevMousePoint = MM.getMousePoint(e, map);
                return MM.cancelEvent(e);
            }

            function mouseMove(e) {
                if (mousePoint) {
                    prevMousePoint = mousePoint;
                    mousePoint = MM.getMousePoint(e, map);
                    lastMove = +new Date();
                    return MM.cancelEvent(e);
                }
            }

            function mouseUp(e) {
                mousePoint = prevMousePoint = null;
                return MM.cancelEvent(e);
            }

            function animate(t) {
                var dir = { x: 0, y: 0 };
                var dt = Math.max(0.001,(t - prevT) / 1000.0);
                if (mousePoint && prevMousePoint &&
                    (lastMove > (+new Date() - 50))) {
                    dir.x = mousePoint.x - prevMousePoint.x;
                    dir.y = mousePoint.y - prevMousePoint.y;
                    speed.x = dir.x;
                    speed.y = dir.y;
                } else {
                    speed.x -= speed.x * drag;
                    speed.y -= speed.y * drag;
                    if (Math.abs(speed.x) < 0.001) {
                        speed.x = 0;
                    }
                    if (Math.abs(speed.y) < 0.001) {
                        speed.y = 0;
                    }
                }
                if (speed.x || speed.y) {
                    map.panBy(speed.x, speed.y);
                }
                prevT = t;
                // tick every frame for time-based anim accuracy
                MM.getFrame(animate);
            }

            MM.addEvent(map.parent, 'click', function(e) {
              map.parent.focus();
            });
            MM.addEvent(map.parent, 'mousedown', mouseDown);
            MM.addEvent(map.parent, 'mousemove', mouseMove);
            MM.addEvent(map.parent, 'mouseup', mouseUp);
            // tick every frame for time-based anim
            prevT = new Date().getTime();
            speed = { x: 0, y: 0 };
            MM.getFrame(animate);
        }
    };

})(this, com.modestmaps);
