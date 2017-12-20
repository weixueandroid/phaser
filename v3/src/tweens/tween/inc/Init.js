var TWEEN_CONST = require('../const');

/**
 * [description]
 *
 * @method Phaser.Tweens.Tween#init
 * @since 3.0.0
 *
 * @return {boolean} Returns `true` if this Tween should be moved from the pending list to the active list by the Tween Manager.
 */
var Init = function ()
{
    var data = this.data;
    var totalTargets = this.totalTargets;

    for (var i = 0; i < this.totalData; i++)
    {
        var tweenData = data[i];
        var target = tweenData.target;
        var gen = tweenData.gen;

        tweenData.delay = gen.delay(i, totalTargets, target);
        tweenData.duration = gen.duration(i, totalTargets, target);
        tweenData.hold = gen.hold(i, totalTargets, target);
        tweenData.repeat = gen.repeat(i, totalTargets, target);
        tweenData.repeatDelay = gen.repeatDelay(i, totalTargets, target);
    }

    this.calcDuration();

    this.progress = 0;
    this.totalProgress = 0;
    this.elapsed = 0;
    this.totalElapsed = 0;

    //  You can't have a paused Tween if it's part of a Timeline
    if (this.paused && !this.parentIsTimeline)
    {
        this.state = TWEEN_CONST.PAUSED;

        return false;
    }
    else
    {
        return true;
    }
};

module.exports = Init;
