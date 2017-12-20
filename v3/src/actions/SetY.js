/**
 * [description]
 *
 * @function Phaser.Actions.SetY
 * @since 3.0.0
 * 
 * @param {array} items - An array of Game Objects. The contents of this array are updated by this Action.
 * @param {number} value - [description]
 * @param {number} [step=0] - [description]
 *
 * @return {array} The array of Game Objects that was passed to this Action.
 */
var SetY = function (items, value, step)
{
    if (step === undefined) { step = 0; }

    for (var i = 0; i < items.length; i++)
    {
        items[i].y = value + (i * step);
    }

    return items;
};

module.exports = SetY;
