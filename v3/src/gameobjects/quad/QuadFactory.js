var Quad = require('./Quad');
var GameObjectFactory = require('../../scene/plugins/GameObjectFactory');

//  When registering a factory function 'this' refers to the GameObjectFactory context.
//  
//  There are several properties available to use:
//  
//  this.scene - a reference to the Scene that owns the GameObjectFactory
//  this.displayList - a reference to the Display List the Scene owns
//  this.updateList - a reference to the Update List the Scene owns

if (WEBGL_RENDERER)
{
    GameObjectFactory.register('quad', function (x, y, key, frame)
    {
        return this.displayList.add(new Quad(this.scene, x, y, key, frame));
    });
}
