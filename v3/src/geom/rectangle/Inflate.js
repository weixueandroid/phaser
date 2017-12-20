var CenterOn = require('./CenterOn');

//  Increases the size of the Rectangle object by the specified amounts.
//  The center point of the Rectangle object stays the same, and its size increases 
//  to the left and right by the x value, and to the top and the bottom by the y value.

/**
 * [description]
 *
 * @function Phaser.Geom.Rectangle.Inflate
 * @since 3.0.0
 *
 * @param {Phaser.Geom.Rectangle} rect - [description]
 * @param {number} x - [description]
 * @param {number} y - [description]
 *
 * @return {Phaser.Geom.Rectangle} [description]
 */
var Inflate = function (rect, x, y)
{
    var cx = rect.centerX;
    var cy = rect.centerY;

    rect.setSize(rect.width + (x * 2), rect.height + (y * 2));

    return CenterOn(rect, cx, cy);
};

module.exports = Inflate;
