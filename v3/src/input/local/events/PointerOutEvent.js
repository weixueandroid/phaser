var Class = require('../../../utils/Class');
var Event = require('../../../events/Event');

var PointerOutEvent = new Class({

    Extends: Event,

    initialize:

    function PointerOutEvent (pointer, gameObjects)
    {
        Event.call(this, 'POINTER_OUT_EVENT');

        //  The Pointer that triggered the event
        this.pointer = pointer;

        //  The native DOM event (MouseEvent, TouchEvent, etc)
        this.event = pointer.event;

        //  The camera on which the input event occurred
        this.camera = pointer.camera;

        //  The x/y coordinates of the event
        this.x = pointer.x;
        this.y = pointer.y;

        //  An array of all the game objects the pointer event occurred on in display list order.
        //  Will be undefined if no objects were interacted with.
        //  If populated, the bottom element (list[0]) is the highest object on the display list.
        //  If InputManager.topOnly is true this array will only contain one element.
        this.list = gameObjects;

        //  A reference to the top-most object on the display list (also this.list[0])
        this.gameObject = gameObjects[0];
    }

});

module.exports = PointerOutEvent;
