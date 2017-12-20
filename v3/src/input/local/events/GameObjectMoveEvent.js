var Class = require('../../../utils/Class');
var Event = require('../../../events/Event');

var GameObjectMoveEvent = new Class({

    Extends: Event,

    initialize:

    function GameObjectMoveEvent (pointer, gameObject)
    {
        Event.call(this, 'GAME_OBJECT_MOVE_EVENT');

        //  The Pointer that triggered the event
        this.pointer = pointer;

        //  The native DOM event (MouseEvent, TouchEvent, etc)
        this.event = pointer.event;

        //  The Game Object the event occurred on
        this.gameObject = gameObject;

        //  The camera on which the input event occurred
        this.camera = pointer.camera;

        //  The local x/y coordinates of the event within the Game Object
        this.x = gameObject.input.localX;
        this.y = gameObject.input.localY;
    }

});

module.exports = GameObjectMoveEvent;
