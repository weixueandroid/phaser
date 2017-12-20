var Class = require('../utils/Class');

var List = new Class({

    initialize:

    function List (parent)
    {
        //  The parent of this list
        this.parent = parent;

        //  The objects that belong to this collection.
        this.list = [];

        this.position = 0;
    },

    add: function (child)
    {
        //  Is child already in this display list?

        if (this.getIndex(child) === -1)
        {
            this.list.push(child);
        }

        return child;
    },

    addAt: function (child, index)
    {
        if (index === undefined) { index = 0; }

        if (this.list.length === 0)
        {
            return this.add(child);
        }

        if (index >= 0 && index <= this.list.length)
        {
            if (this.getIndex(child) === -1)
            {
                this.list.splice(index, 0, child);
            }
        }

        return child;
    },

    addMultiple: function (children)
    {
        if (Array.isArray(children))
        {
            for (var i = 0; i < children.length; i++)
            {
                this.add(children[i]);
            }
        }

        return children;
    },

    getAt: function (index)
    {
        return this.list[index];
    },

    getIndex: function (child)
    {
        //  Return -1 if given child isn't a child of this display list
        return this.list.indexOf(child);
    },

    //  Given an array of objects, sort the array and return it,
    //  so that the objects are in index order with the lowest at the bottom.
    sort: function (children)
    {
        if (children === undefined) { children = this.list; }

        return children.sort(this.sortIndexHandler.bind(this));
    },

    //  Return the child lowest down the display list (with the smallest index)
    sortIndexHandler: function (childA, childB)
    {
        //  The lower the index, the lower down the display list they are
        var indexA = this.getIndex(childA);
        var indexB = this.getIndex(childB);

        if (indexA < indexB)
        {
            return -1;
        }
        else if (indexA > indexB)
        {
            return 1;
        }

        //  Technically this shouldn't happen, but if the GO wasn't part of this display list then it'll
        //  have an index of -1, so in some cases it can
        return 0;
    },

    /**
    * Gets the first item from the set based on the property strictly equaling the value given.
    * Returns null if not found.
    *
    * @method Phaser.ArraySet#getByKey
    * @param {string} property - The property to check against the value.
    * @param {any} value - The value to check if the property strictly equals.
    * @return {any} The item that was found, or null if nothing matched.
    */
    getByKey: function (property, value)
    {
        for (var i = 0; i < this.list.length; i++)
        {
            if (this.list[i][property] === value)
            {
                return this.list[i];
            }
        }

        return null;
    },

    /**
    * Searches the Group for the first instance of a child with the `name`
    * property matching the given argument. Should more than one child have
    * the same name only the first instance is returned.
    *
    * @method Phaser.Group#getByName
    * @param {string} name - The name to search for.
    * @return {any} The first child with a matching name, or null if none were found.
    */
    getByName: function (name)
    {
        return this.getByKey('name', name);
    },

    /**
    * Returns a random child from the group.
    *
    * @method Phaser.Group#getRandom
    * @param {integer} [startIndex=0] - Offset from the front of the group (lowest child).
    * @param {integer} [length=(to top)] - Restriction on the number of values you want to randomly select from.
    * @return {any} A random child of this Group.
    */
    getRandom: function (startIndex, length)
    {
        if (startIndex === undefined) { startIndex = 0; }
        if (length === undefined) { length = this.list.length; }

        if (length === 0 || length > this.list.length)
        {
            return null;
        }

        var randomIndex = startIndex + Math.floor(Math.random() * length);

        return this.list[randomIndex];
    },

    getFirst: function (property, value, startIndex, endIndex)
    {
        if (startIndex === undefined) { startIndex = 0; }
        if (endIndex === undefined) { endIndex = this.list.length; }

        for (var i = startIndex; i < endIndex; i++)
        {
            var child = this.list[i];

            if (child[property] === value)
            {
                return child;
            }
        }

        return null;
    },

    /**
    * Returns all children in this Group.
    *
    * You can optionally specify a matching criteria using the `property` and `value` arguments.
    *
    * For example: `getAll('exists', true)` would return only children that have their exists property set.
    *
    * Optionally you can specify a start and end index. For example if this Group had 100 children,
    * and you set `startIndex` to 0 and `endIndex` to 50, it would return matches from only
    * the first 50 children in the Group.
    *
    * @method Phaser.Group#getAll
    * @param {string} [property] - An optional property to test against the value argument.
    * @param {any} [value] - If property is set then Child.property must strictly equal this value to be included in the results.
    * @param {integer} [startIndex=0] - The first child index to start the search from.
    * @param {integer} [endIndex] - The last child index to search up until.
    * @return {any} A random existing child of this Group.
    */
    getAll: function (property, value, startIndex, endIndex)
    {
        if (startIndex === undefined) { startIndex = 0; }
        if (endIndex === undefined) { endIndex = this.list.length; }

        var output = [];

        for (var i = startIndex; i < endIndex; i++)
        {
            var child = this.list[i];

            if (property)
            {
                if (child[property] === value)
                {
                    output.push(child);
                }
            }
            else
            {
                output.push(child);
            }
        }

        return output;
    },

    count: function (property, value)
    {
        var total = 0;

        for (var i = 0; i < this.list.length; i++)
        {
            var child = this.list[i];

            if (child[property] === value)
            {
                total++;
            }
        }

        return total;
    },

    swap: function (child1, child2)
    {
        if (child1 === child2)
        {
            return;
        }

        var index1 = this.getIndex(child1);
        var index2 = this.getIndex(child2);

        if (index1 < 0 || index2 < 0)
        {
            throw new Error('List.swap: Supplied objects must be children of the same list');
        }

        this.list[index1] = child2;
        this.list[index2] = child1;
    },

    //   was setIndex
    moveTo: function (child, index)
    {
        var currentIndex = this.getIndex(child);

        if (currentIndex === -1 || index < 0 || index >= this.list.length)
        {
            throw new Error('List.moveTo: The supplied index is out of bounds');
        }

        //  Remove
        this.list.splice(currentIndex, 1);

        //  Add in new location
        this.list.splice(index, 0, child);

        return child;
    },

    remove: function (child)
    {
        var index = this.list.indexOf(child);

        if (index !== -1)
        {
            this.list.splice(index, 1);
        }
        
        return child;
    },

    removeAt: function (index)
    {
        var child = this.list[index];

        if (child)
        {
            this.children.splice(index, 1);
        }

        return child;
    },

    removeBetween: function (beginIndex, endIndex)
    {
        if (beginIndex === undefined) { beginIndex = 0; }
        if (endIndex === undefined) { endIndex = this.list.length; }

        var range = endIndex - beginIndex;

        if (range > 0 && range <= endIndex)
        {
            var removed = this.list.splice(beginIndex, range);

            return removed;
        }
        else if (range === 0 && this.list.length === 0)
        {
            return [];
        }
        else
        {
            throw new Error('List.removeBetween: Range Error, numeric values are outside the acceptable range');
        }
    },

    /**
    * Removes all the items.
    *
    * @method Phaser.ArraySet#removeAll
    */
    removeAll: function ()
    {
        var i = this.list.length;

        while (i--)
        {
            this.remove(this.list[i]);
        }

        return this;
    },

    shutdown: function ()
    {
        this.removeAll();
    },

    /**
    * Brings the given child to the top of this group so it renders above all other children.
    *
    * @method Phaser.Group#bringToTop
    * @param {any} child - The child to bring to the top of this group.
    * @return {any} The child that was moved.
    */
    bringToTop: function (child)
    {
        if (this.getIndex(child) < this.list.length)
        {
            this.remove(child);
            this.add(child);
        }

        return child;
    },

    /**
    * Sends the given child to the bottom of this group so it renders below all other children.
    *
    * @method Phaser.Group#sendToBack
    * @param {any} child - The child to send to the bottom of this group.
    * @return {any} The child that was moved.
    */
    sendToBack: function (child)
    {
        if (this.getIndex(child) > 0)
        {
            this.remove(child);
            this.addAt(child, 0);
        }

        return child;
    },

    /**
    * Moves the given child up one place in this group unless it's already at the top.
    *
    * @method Phaser.Group#moveUp
    * @param {any} child - The child to move up in the group.
    * @return {any} The child that was moved.
    */
    moveUp: function (child)
    {
        var a = this.getIndex(child);

        if (a !== -1 && a < this.list.length - 1)
        {
            var b = this.getAt(a + 1);

            if (b)
            {
                this.swap(child, b);
            }
        }

        return child;
    },

    /**
    * Moves the given child down one place in this group unless it's already at the bottom.
    *
    * @method Phaser.Group#moveDown
    * @param {any} child - The child to move down in the group.
    * @return {any} The child that was moved.
    */
    moveDown: function (child)
    {
        var a = this.getIndex(child);

        if (a > 0)
        {
            var b = this.getAt(a - 1);

            if (b)
            {
                this.swap(child, b);
            }
        }

        return child;
    },

    /**
    * Reverses all children in this group.
    *
    * This operation applies only to immediate children and does not propagate to subgroups.
    *
    * @method Phaser.Group#reverse
    */
    reverse: function ()
    {
        this.list.reverse();

        return this;
    },

    shuffle: function ()
    {
        for (var i = this.list.length - 1; i > 0; i--)
        {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = this.list[i];
            this.list[i] = this.list[j];
            this.list[j] = temp;
        }

        return this;
    },

    /**
    * Replaces a child of this Group with the given newChild. The newChild cannot be a member of this Group.
    *
    * If `Group.enableBody` is set, then a physics body will be created on the object, so long as one does not already exist.
    *
    * If `Group.inputEnableChildren` is set, then an Input Handler will be created on the object, so long as one does not already exist.
    *
    * @method Phaser.Group#replace
    * @param {any} oldChild - The child in this group that will be replaced.
    * @param {any} newChild - The child to be inserted into this group.
    * @return {any} Returns the oldChild that was replaced within this group.
    */
    replace: function (oldChild, newChild)
    {
        var index = this.getIndex(oldChild);

        if (index !== -1)
        {
            this.remove(oldChild);

            this.addAt(newChild, index);

            return oldChild;
        }
    },

    /**
    * Checks for the item within this list.
    *
    * @method Phaser.ArraySet#exists
    * @param {any} item - The element to get the list index for.
    * @return {boolean} True if the item is found in the list, otherwise false.
    */
    exists: function (child)
    {
        return (this.list.indexOf(child) > -1);
    },

    /**
    * Sets the property `key` to the given value on all members of this list.
    *
    * @method Phaser.ArraySet#setAll
    * @param {any} key - The property of the item to set.
    * @param {any} value - The value to set the property to.
    */
    setAll: function (key, value)
    {
        for (var i = 0; i < this.list.length; i++)
        {
            if (this.list[i])
            {
                this.list[i][key] = value;
            }
        }
    },

    /**
    * Passes all children to the given callback.
    *
    * @method each
    * @param {function} callback - The function to call.
    * @param {object} [thisArg] - Value to use as `this` when executing callback.
    * @param {...*} [arguments] - Additional arguments that will be passed to the callback, after the child.
    */
    each: function (callback, thisArg)
    {
        var args = [ null ];

        for (var i = 1; i < arguments.length; i++)
        {
            args.push(arguments[i]);
        }

        for (i = 0; i < this.list.length; i++)
        {
            args[0] = this.list[i];
            callback.apply(thisArg, args);
        }
    },

    length: {

        get: function ()
        {
            return this.list.length;
        }

    },

    first: {

        get: function ()
        {
            this.position = 0;

            if (this.list.length > 0)
            {
                return this.list[0];
            }
            else
            {
                return null;
            }
        }

    },

    last: {

        get: function ()
        {
            if (this.list.length > 0)
            {
                this.position = this.list.length - 1;

                return this.list[this.position];
            }
            else
            {
                return null;
            }
        }

    },

    next: {

        get: function ()
        {
            if (this.position < this.list.length)
            {
                this.position++;

                return this.list[this.position];
            }
            else
            {
                return null;
            }
        }

    },

    previous: {

        get: function ()
        {
            if (this.position > 0)
            {
                this.position--;

                return this.list[this.position];
            }
            else
            {
                return null;
            }
        }

    }

});

module.exports = List;
