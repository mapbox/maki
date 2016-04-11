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

module.exports = Curve4Div;

function Curve4Div() {}

Curve4Div.curve_collinearity_epsilon = 1e-30;
Curve4Div.curve_angle_tolerance_epsilon = 0.01;
Curve4Div.curve_recursion_limit = 32;

Curve4Div.prototype.approximation_scale = 1.0;
Curve4Div.prototype.angle_tolerance = 0.0;
Curve4Div.prototype.cusp_limit = 0.0;


Curve4Div.prototype.init = function(x1, y1, x2, y2, x3, y3, x4, y4) {
    this.points = [];
    this.distance_tolerance_square = 0.5 / this.approximation_scale;
    this.distance_tolerance_square *= this.distance_tolerance_square;
    this.bezier(x1, y1, x2, y2, x3, y3, x4, y4);
};

Curve4Div.prototype.bezier = function(x1, y1, x2, y2, x3, y3, x4, y4) {
    this.points.push(point_d(x1, y1));
    this.recursive_bezier(x1, y1, x2, y2, x3, y3, x4, y4, 0);
    this.points.push(point_d(x4, y4));
};

Curve4Div.prototype.recursive_bezier = function(x1, y1, x2, y2, x3, y3, x4, y4, level) {
    if (level > Curve4Div.curve_recursion_limit) {
        return;
    }

    // Calculate all the mid-points of the line segments
    var x12 = (x1 + x2) / 2;
    var y12 = (y1 + y2) / 2;
    var x23 = (x2 + x3) / 2;
    var y23 = (y2 + y3) / 2;
    var x34 = (x3 + x4) / 2;
    var y34 = (y3 + y4) / 2;
    var x123 = (x12 + x23) / 2;
    var y123 = (y12 + y23) / 2;
    var x234 = (x23 + x34) / 2;
    var y234 = (y23 + y34) / 2;
    var x1234 = (x123 + x234) / 2;
    var y1234 = (y123 + y234) / 2;

    // Try to approximate the full cubic curve by a single straight line
    var dx = x4 - x1;
    var dy = y4 - y1;

    var d2 = Math.abs(((x2 - x4) * dy - (y2 - y4) * dx));
    var d3 = Math.abs(((x3 - x4) * dy - (y3 - y4) * dx));
    var da1, da2, k;

    switch ((Math.floor(d2 > Curve4Div.curve_collinearity_epsilon) << 1) +
        Math.floor(d3 > Curve4Div.curve_collinearity_epsilon)) {
        case 0:
            // All collinear OR p1==p4
            k = dx * dx + dy * dy;
            if (k === 0) {
                d2 = calc_sq_distance(x1, y1, x2, y2);
                d3 = calc_sq_distance(x4, y4, x3, y3);
            } else {
                k = 1 / k;
                da1 = x2 - x1;
                da2 = y2 - y1;
                d2 = k * (da1 * dx + da2 * dy);
                da1 = x3 - x1;
                da2 = y3 - y1;
                d3 = k * (da1 * dx + da2 * dy);
                if (d2 > 0 && d2 < 1 && d3 > 0 && d3 < 1) {
                    // Simple collinear case, 1---2---3---4
                    // We can leave just two endpoints
                    return;
                }
                if (d2 <= 0) {
                    d2 = calc_sq_distance(x2, y2, x1, y1);
                } else if (d2 >= 1) {
                    d2 = calc_sq_distance(x2, y2, x4, y4);
                } else {
                    d2 = calc_sq_distance(x2, y2, x1 + d2 * dx, y1 + d2 * dy);
                }

                if (d3 <= 0) {
                    d3 = calc_sq_distance(x3, y3, x1, y1);
                } else if (d3 >= 1) {
                    d3 = calc_sq_distance(x3, y3, x4, y4);
                } else {
                    d3 = calc_sq_distance(x3, y3, x1 + d3 * dx, y1 + d3 * dy);
                }
            }

            if (d2 > d3) {
                if (d2 < this.distance_tolerance_square) {
                    this.points.push(point_d(x2, y2));
                    return;
                }
            } else {
                if (d3 < this.distance_tolerance_square) {
                    this.points.push(point_d(x3, y3));
                    return;
                }
            }
            break;

        case 1:
            // p1,p2,p4 are collinear, p3 is significant
            if (d3 * d3 <= this.distance_tolerance_square * (dx * dx + dy * dy)) {
                if (this.angle_tolerance < Curve4Div.curve_angle_tolerance_epsilon) {
                    this.points.push(point_d(x23, y23));
                    return;
                }

                // Angle Condition
                da1 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y3 - y2, x3 - x2));
                if (da1 >= Math.PI) da1 = 2 * Math.PI - da1;

                if (da1 < this.angle_tolerance) {
                    this.points.push(point_d(x2, y2));
                    this.points.push(point_d(x3, y3));
                    return;
                }

                if (this.cusp_limit !== 0.0) {
                    if (da1 > this.cusp_limit) {
                        this.points.push(point_d(x3, y3));
                        return;
                    }
                }
            }
            break;

        case 2:
            // p1,p3,p4 are collinear, p2 is significant
            if (d2 * d2 <= this.distance_tolerance_square * (dx * dx + dy * dy)) {
                if (this.angle_tolerance < Curve4Div.curve_angle_tolerance_epsilon) {
                    this.points.push(point_d(x23, y23));
                    return;
                }

                // Angle Condition
                da1 = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1));
                if (da1 >= Math.PI) da1 = 2 * Math.PI - da1;

                if (da1 < this.angle_tolerance) {
                    this.points.push(point_d(x2, y2));
                    this.points.push(point_d(x3, y3));
                    return;
                }

                if (this.cusp_limit !== 0.0) {
                    if (da1 > this.cusp_limit) {
                        this.points.push(point_d(x2, y2));
                        return;
                    }
                }
            }
            break;

        case 3:
            // Regular case
            if ((d2 + d3) * (d2 + d3) <= this.distance_tolerance_square * (dx * dx + dy * dy)) {
                // If the curvature doesn't exceed the distance_tolerance value
                // we tend to finish subdivisions.
                if (this.angle_tolerance < Curve4Div.curve_angle_tolerance_epsilon) {
                    this.points.push(point_d(x23, y23));
                    return;
                }

                // Angle & Cusp Condition
                k = Math.atan2(y3 - y2, x3 - x2);
                da1 = Math.abs(k - Math.atan2(y2 - y1, x2 - x1));
                da2 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - k);
                if (da1 >= Math.PI) da1 = 2 * Math.PI - da1;
                if (da2 >= Math.PI) da2 = 2 * Math.PI - da2;

                if (da1 + da2 < this.angle_tolerance) {
                    // Finally we can stop the recursion
                    this.points.push(point_d(x23, y23));
                    return;
                }

                if (this.cusp_limit !== 0.0) {
                    if (da1 > this.cusp_limit) {
                        this.points.push(point_d(x2, y2));
                        return;
                    }

                    if (da2 > this.cusp_limit) {
                        this.points.push(point_d(x3, y3));
                        return;
                    }
                }
            }
            break;
    }

    // Continue subdivision
    this.recursive_bezier(x1, y1, x12, y12, x123, y123, x1234, y1234, level + 1);
    this.recursive_bezier(x1234, y1234, x234, y234, x34, y34, x4, y4, level + 1);
};
