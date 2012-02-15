var wax = wax || {};
wax.movetip = {};

wax.movetip = function(options) {
    options = options || {};
    var t = {},
        _currentTooltip = undefined,
        _context = undefined,
        _animationOut = options.animationOut,
        _animationIn = options.animationIn;

    // Helper function to determine whether a given element is a wax popup.
    function isPopup (el) {
        return el && el.className.indexOf('wax-popup') !== -1;
    }

    function getTooltip(feature, context) {
        var tooltip = document.createElement('div');
        tooltip.className = 'wax-movetip';
        tooltip.style.cssText = 'position:absolute;'
        tooltip.innerHTML = feature;
        context.appendChild(tooltip);
        _context = context;
        _tooltipOffset = wax.util.offset(tooltip);
        _contextOffset = wax.util.offset(_context);
        return tooltip;
    }

    function moveTooltip(e) {
        if (!_currentTooltip) return;
        var eo = wax.util.eventoffset(e);

        _currentTooltip.className = 'wax-movetip';

        // faux-positioning
        if ((_tooltipOffset.height + eo.y) >
            (_contextOffset.top + _contextOffset.height) &&
            (_contextOffset.height > _tooltipOffset.height)) {
            eo.y -= _tooltipOffset.height;
            _currentTooltip.className += ' flip-y';
        }

        // faux-positioning
        if ((_tooltipOffset.width + eo.x) >
            (_contextOffset.left + _contextOffset.width)) {
            eo.x -= _tooltipOffset.width;
            _currentTooltip.className += ' flip-x';
        }

        _currentTooltip.style.left = eo.x + 'px';
        _currentTooltip.style.top = eo.y + 'px';
    }

    // Hide a given tooltip.
    function hideTooltip(el) {
        if (!el) return;
        var event,
            remove = function() {
            if (this.parentNode) this.parentNode.removeChild(this);
        };

        if (el.style['-webkit-transition'] !== undefined && _animationOut) {
            event = 'webkitTransitionEnd';
        } else if (el.style.MozTransition !== undefined && _animationOut) {
            event = 'transitionend';
        }

        if (event) {
            // This code assumes that transform-supporting browsers
            // also support proper events. IE9 does both.
            el.addEventListener(event, remove, false);
            el.addEventListener('transitionend', remove, false);
            el.className += ' ' + _animationOut;
        } else {
            if (el.parentNode) el.parentNode.removeChild(el);
        }
    }

    // Expand a tooltip to be a "popup". Suspends all other tooltips from being
    // shown until this popup is closed or another popup is opened.
    function click(feature, context) {
        // Hide any current tooltips.
        if (_currentTooltip) {
            hideTooltip(_currentTooltip);
            _currentTooltip = undefined;
        }

        var tooltip = getTooltip(feature, context);
        tooltip.className += ' wax-popup';
        tooltip.innerHTML = feature;

        var close = document.createElement('a');
        close.href = '#close';
        close.className = 'close';
        close.innerHTML = 'Close';
        tooltip.appendChild(close);

        var closeClick = function(ev) {
            hideTooltip(tooltip);
            _currentTooltip = undefined;
            ev.returnValue = false; // Prevents hash change.
            if (ev.stopPropagation) ev.stopPropagation();
            if (ev.preventDefault) ev.preventDefault();
            return false;
        };

        // IE compatibility.
        if (close.addEventListener) {
            close.addEventListener('click', closeClick, false);
        } else if (close.attachEvent) {
            close.attachEvent('onclick', closeClick);
        }

        _currentTooltip = tooltip;
    }

    t.over = function(feature, context, e) {
        if (!feature) return;
        context.style.cursor = 'pointer';

        if (isPopup(_currentTooltip)) {
            return;
        } else {
            _currentTooltip = getTooltip(feature, context);
            moveTooltip(e);
            if (context.addEventListener) {
                context.addEventListener('mousemove', moveTooltip);
            }
        }
    };

    // Hide all tooltips on this layer and show the first hidden tooltip on the
    // highest layer underneath if found.
    t.out = function(context) {
        context.style.cursor = 'default';

        if (isPopup(_currentTooltip)) {
            return;
        } else if (_currentTooltip) {
            hideTooltip(_currentTooltip);
            if (context.removeEventListener) {
                context.removeEventListener('mousemove', moveTooltip);
            }
            _currentTooltip = undefined;
        }
    };

    return t;
};
