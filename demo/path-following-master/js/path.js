/**
 * Path object
 *
 * @name Path
 * @constructor
 *
 * @property {Array} points A list of path points
 * @property {Number} radius Path radius
 */

var Path = function() {
  'use strict';

  this.points = [];
  this.radius = 0;

  /**
   * Add a point to path
   *
   * @function
   * @memberOf Path
   *
   * @param {Number} x X coordinate of the path point
   * @param {Number} y Y coordinate of the path point
   */
  this.addPoint = function (x, y) {
    var point = vec2.fromValues(x, y);

    this.points.push(point);
  };

  /**
   * Render path
   *
   * @function
   * @memberOf Path
   */
  this.display = function() {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#e7e7e7';
    ctx.lineWidth = this.radius * 2;

    ctx.beginPath();

    for (var i = 0; i < this.points.length; i++) {
      ctx.lineTo(this.points[i][0], this.points[i][1]);
    }
    ctx.closePath();

    ctx.stroke();
  };
};
