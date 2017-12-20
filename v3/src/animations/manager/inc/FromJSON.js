/**
 * [description]
 *
 * @method Phaser.Animations.AnimationManager#fromJSON
 * @since 3.0.0
 * 
 * @param {string|object} data - [description]
 * @param {boolean} [clearCurrentAnimations=false] - [description]
 * 
 * @return {Phaser.Animations.Animation[]} An array containing all of the Animation objects that were created as a result of this call.
 */
var FromJSON = function (data, clearCurrentAnimations)
{
    if (clearCurrentAnimations === undefined) { clearCurrentAnimations = false; }

    if (clearCurrentAnimations)
    {
        this.anims.clear();
    }

    //  Do we have a String (i.e. from JSON, or an Object?)
    if (typeof data === 'string')
    {
        data = JSON.parse(data);
    }

    var output = [];

    //  Array of animations, or a single animation?
    if (data.hasOwnProperty('anims') && Array.isArray(data.anims))
    {
        for (var i = 0; i < data.anims.length; i++)
        {
            output.push(this.create(data.anims[i]));
        }

        if (data.hasOwnProperty('globalTimeScale'))
        {
            this.globalTimeScale = data.globalTimeScale;
        }
    }
    else if (data.hasOwnProperty('key') && data.type === 'frame')
    {
        output.push(this.create(data));
    }

    return output;
};

module.exports = FromJSON;
