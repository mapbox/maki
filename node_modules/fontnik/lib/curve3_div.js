// Based on:
//----------------------------------------------------------------------------
// Anti-Grain Geometry - Version 2.4
// Copyright (C) 2002-2005 Maxim Shemanarev (http://www.antigrain.com)
// Copyright (C) 2005 Tony Juricic (tonygeek@yahoo.com)
//
// Permission to copy, use, modify, sell and distribute this software
// is granted provided this copyright notice appears in all copies.
// This software is provided "as is" without express or implied
// warranty, and with no claim as to its suitability for any purpose.
//
//----------------------------------------------------------------------------
// Contact: mcseem@antigrain.com
//          mcseemagg@yahoo.com
//          http://www.antigrain.com
//----------------------------------------------------------------------------

'use strict';

function point_d(x, y) {
    return [x, y];
}

function calc_sq_distance(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return dx * dx + dy * dy;
}

module.exports = Curve3Div;

function Curve3Div() {}

Curve3Div.curve_collinearity_epsilon = 1e-30;
Curve3Div.curve_angle_tolerance_epsilon = 0.01;
Curve3Div.curve_recursion_limit = 32;

Curve3Div.prototype.approximation_scale = 1.0;
Curve3Div.prototype.angle_tolerance = 0.0;
Curve3Div.prototype.cusp_limit = 0.0;


Curve3Div.prototype.init = function(x1, y1, x2, y2, x3, y3) {
    this.points = [];
    this.distance_tolerance_square = 0.5 / this.approximation_scale;
    this.distance_tolerance_square *= this.distance_tolerance_square;
    this.bezier(x1, y1, x2, y2, x3, y3);
};

Curve3Div.prototype.bezier = function(x1, y1, x2, y2, x3, y3) {
    this.points.push(point_d(x1, y1));
    this.recursive_bezier(x1, y1, x2, y2, x3, y3, 0);
    this.points.push(point_d(x3, y3));
};

Curve3Div.prototype.recursive_bezier = function(x1, y1, x2, y2, x3, y3, level) {
    if (level > Curve3Div.curve_recursion_limit) {
        return;
    }

    // Calculate all the mid-points of the line segments
    var x12 = (x1 + x2) / 2;
    var y12 = (y1 + y2) / 2;
    var x23 = (x2 + x3) / 2;
    var y23 = (y2 + y3) / 2;
    var x123 = (x12 + x23) / 2;
    var y123 = (y12 + y23) / 2;

    var dx = x3 - x1;
    var dy = y3 - y1;
    var d = Math.abs(((x2 - x3) * dy - (y2 - y3) * dx));
    var da;

    if (d > Curve3Div.curve_collinearity_epsilon) {
        // Regular case
        if (d * d <= this.distance_tolerance_square * (dx * dx + dy * dy)) {
            // If the curvature doesn't exceed the distance_tolerance value
            // we tend to finish subdivisions.
            if (this.angle_tolerance < Curve3Div.curve_angle_tolerance_epsilon) {
                this.points.push(point_d(x123, y123));
                return;
            }

            // Angle & Cusp Condition
            da = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1));
            if (da >= Math.PI) {
                da = 2 * Math.PI - da;
            }

            if (da < this.angle_tolerance) {
                // Finally we can stop the recursion
                this.points.push(point_d(x123, y123));
                return;
            }
        }
    } else {
        // Collinear case
        da = dx * dx + dy * dy;
        if (da === 0) {
            d = calc_sq_distance(x1, y1, x2, y2);
        } else {
            d = ((x2 - x1) * dx + (y2 - y1) * dy) / da;
            if (d > 0 && d < 1) {
              // Simple collinear case, 1---2---3
              // We can leave just two endpoints
              return;
            }
            if (d <= 0) {
                d = calc_sq_distance(x2, y2, x1, y1);
            } else if (d >= 1) {
                d = calc_sq_distance(x2, y2, x3, y3);
            } else {
                d = calc_sq_distance(x2, y2, x1 + d * dx, y1 + d * dy);
            }
        }
        if (d < this.distance_tolerance_square) {
            this.points.push(point_d(x2, y2));
            return;
        }
    }

    // Continue subdivision
    this.recursive_bezier(x1, y1, x12, y12, x123, y123, level + 1);
    this.recursive_bezier(x123, y123, x23, y23, x3, y3, level + 1);
};
