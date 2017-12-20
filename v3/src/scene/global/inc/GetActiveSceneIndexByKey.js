/**
 * [description]
 *
 * @method Phaser.Scenes.GlobalSceneManager#getActiveSceneIndexByKey
 * @since 3.0.0
 *
 * @param {string} key - [description]
 *
 * @return {integer} [description]
 */
var GetActiveSceneIndexByKey = function (key)
{
    var scene = this.keys[key];

    for (var i = 0; i < this.active.length; i++)
    {
        if (this.active[i].scene === scene)
        {
            return this.active[i].index;
        }
    }

    return -1;
};

module.exports = GetActiveSceneIndexByKey;
