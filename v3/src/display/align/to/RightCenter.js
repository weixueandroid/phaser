var GetRight = require('../../bounds/GetRight');
var GetCenterY = require('../../bounds/GetCenterY');
var SetLeft = require('../../bounds/SetLeft');
var SetCenterY = require('../../bounds/SetCenterY');

/**
 * [description]
 *
 * @function Phaser.Display.Align.To.RightTop
 * @since 3.0.0
 *
 * @param {Phaser.GameObjects.GameObject} gameObject - [description]
 * @param {Phaser.GameObjects.GameObject} container - [description]
 * @param {number} [offsetX=0] - [description]
 * @param {number} [offsetY=0] - [description]
 *
 * @return {Phaser.GameObjects.GameObject} [description]
 */
var RightTop = function (gameObject, parent, offsetX, offsetY)
{
    if (offsetX === undefined) { offsetX = 0; }
    if (offsetY === undefined) { offsetY = 0; }

    SetLeft(gameObject, GetRight(parent) + offsetX);
    SetCenterY(gameObject, GetCenterY(parent) + offsetY);

    return gameObject;
};

module.exports = RightTop;
