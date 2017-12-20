var Class = require('../../../utils/Class');
var Event = require('../../../events/Event');

var PauseAllAnimationEvent = new Class({

    Extends: Event,

    initialize:

    /**
     * [description]
     *
     * @event PauseAllAnimationEvent
     * @type {Phaser.Event}
     */
    function PauseAllAnimationEvent ()
    {
        Event.call(this, 'PAUSE_ALL_ANIMATION_EVENT');
    }

});

module.exports = PauseAllAnimationEvent;
