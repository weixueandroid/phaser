var WorldToTileX = require('./WorldToTileX');
var WorldToTileY = require('./WorldToTileY');
var Vector2 = require('../../../math/Vector2');

/**
 * Converts from world XY coordinates (pixels) to tile XY coordinates (tile units), factoring in the
 * layer's position, scale and scroll. This will return a new Vector2 object or update the given
 * `point` object.
 *
 * @param {number} worldX - [description]
 * @param {number} worldY - [description]
 * @param {boolean} [snapToFloor=true] - Whether or not to round the tile coordinate down to the
 * nearest integer.
 * @param {Vector2} [point] - [description]
 * @param {Camera} [camera=main camera] - [description]
 * @param {LayerData} layer - [description]
 * @returns {Vector2} The XY location in tile units.
 */
var WorldToTileXY = function (worldX, worldY, snapToFloor, point, camera, layer)
{
    if (point === undefined) { point = new Vector2(0, 0); }

    point.x = WorldToTileX(worldX, snapToFloor, camera, layer);
    point.y = WorldToTileY(worldY, snapToFloor, camera, layer);

    return point;
};

module.exports = WorldToTileXY;
