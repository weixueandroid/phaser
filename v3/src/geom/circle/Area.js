/**
 * [description]
 *
 * @function Phaser.Geom.Circle.Area
 * @since 3.0.0
 *
 * @param {Phaser.Geom.Circle} circle - The Circle to get the area of.
 *
 * @return {number} The area of the Circle.
 */
var Area = function (circle)
{
    return (circle.radius > 0) ? Math.PI * circle.radius * circle.radius : 0;
};

module.exports = Area;
