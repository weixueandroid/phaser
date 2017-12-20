var TWEEN_CONST = require('../const');

/**
 * [description]
 *
 * @method Phaser.Tweens.Tween#nextState
 * @since 3.0.0
 */
var NextState = function ()
{
    if (this.loopCounter > 0)
    {
        this.elapsed = 0;
        this.progress = 0;
        this.loopCounter--;

        var onLoop = this.callbacks.onLoop;

        if (onLoop)
        {
            onLoop.params[1] = this.targets;

            onLoop.func.apply(onLoop.scope, onLoop.params);
        }

        this.resetTweenData(true);

        if (this.loopDelay > 0)
        {
            this.countdown = this.loopDelay;
            this.state = TWEEN_CONST.LOOP_DELAY;
        }
        else
        {
            this.state = TWEEN_CONST.ACTIVE;
        }
    }
    else if (this.completeDelay > 0)
    {
        this.countdown = this.completeDelay;
        this.state = TWEEN_CONST.COMPLETE_DELAY;
    }
    else
    {
        var onComplete = this.callbacks.onComplete;

        if (onComplete)
        {
            onComplete.params[1] = this.targets;

            onComplete.func.apply(onComplete.scope, onComplete.params);
        }

        this.state = TWEEN_CONST.PENDING_REMOVE;
    }
};

module.exports = NextState;
