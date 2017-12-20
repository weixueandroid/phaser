
var Class = require('../utils/Class');
var Extend = require('../utils/object/Extend');

/**
* A Frame is a section of a Texture.
*/
var Frame = new Class({

    initialize:

    function Frame (texture, name, sourceIndex, x, y, width, height)
    {
        /**
        * @property {Phaser.Texture} texture - The Texture this frame belongs to.
        */
        this.texture = texture;

        /**
        * @property {string} name - The name of this frame within the Texture.
        */
        this.name = name;

        this.source = texture.source[sourceIndex];

        this.sourceIndex = sourceIndex;

        /**
        * @property {number} cutX - X position within the source image to cut from.
        */
        this.cutX = x;

        /**
        * @property {number} cutY - Y position within the source image to cut from.
        */
        this.cutY = y;

        /**
        * @property {number} cutWidth - The width of the area in the source image to cut.
        */
        this.cutWidth = width;

        /**
        * @property {number} cutHeight - The height of the area in the source image to cut.
        */
        this.cutHeight = height;

        /**
        * @property {number} x - The X rendering offset of this Frame, taking trim into account.
        */
        this.x = 0;

        /**
        * @property {number} y - The Y rendering offset of this Frame, taking trim into account.
        */
        this.y = 0;

        /**
        * @property {number} width - The rendering width of this Frame, taking trim into account.
        */
        this.width = width;

        /**
        * @property {number} height - The rendering height of this Frame, taking trim into account.
        */
        this.height = height;

        //  The half sizes of this frame (to save in constant calculations in the renderer)
        this.halfWidth = Math.floor(width * 0.5);

        this.halfHeight = Math.floor(height * 0.5);

        /**
        * @property {number} width - The rendering width of this Frame, taking trim into account.
        */
        this.centerX = Math.floor(width / 2);

        /**
        * @property {number} height - The rendering height of this Frame, taking trim into account.
        */
        this.centerY = Math.floor(height / 2);

        /**
        * Is this frame is rotated or not in the Texture?
        * Rotation allows you to use rotated frames in texture atlas packing.
        * It has nothing to do with Sprite rotation.
        *
        * @property {boolean} rotated
        * @default
        */
        this.rotated = false;

        //  Over-rides the Renderer setting? -1 = use Renderer Setting, 0 = No rounding, 1 = Round
        this.autoRound = -1;

        /**
        * The un-modified source frame, trim and UV data.
        *
        * @private
        * @property {object} data
        */
        this.data = {
            cut: {
                x: x,
                y: y,
                w: width,
                h: height,
                r: x + width,
                b: y + height
            },
            trim: false,
            sourceSize: {
                w: width,
                h: height
            },
            spriteSourceSize: {
                x: 0,
                y: 0,
                w: width,
                h: height
            },
            uvs: {
                x0: 0,
                y0: 0,
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0,
                x3: 0,
                y3: 0
            },
            radius: 0.5 * Math.sqrt(width * width + height * height),
            drawImage: {
                sx: x,
                sy: y,
                sWidth: width,
                sHeight: height,
                dWidth: width,
                dHeight: height
            }
        };

        this.updateUVs();
    },

    /**
    * If the frame was trimmed when added to the Texture Atlas, this records the trim and source data.
    *
    * @method Phaser.TextureFrame#setTrim
    * @param {number} actualWidth - The width of the frame before being trimmed.
    * @param {number} actualHeight - The height of the frame before being trimmed.
    * @param {number} destX - The destination X position of the trimmed frame for display.
    * @param {number} destY - The destination Y position of the trimmed frame for display.
    * @param {number} destWidth - The destination width of the trimmed frame for display.
    * @param {number} destHeight - The destination height of the trimmed frame for display.
    */
    setTrim: function (actualWidth, actualHeight, destX, destY, destWidth, destHeight)
    {
        var data = this.data;
        var ss = data.spriteSourceSize;

        //  Store actual values

        data.trim = true;

        data.sourceSize.w = actualWidth;
        data.sourceSize.h = actualHeight;

        ss.x = destX;
        ss.y = destY;
        ss.w = destWidth;
        ss.h = destHeight;

        //  Adjust properties
        this.x = destX;
        this.y = destY;

        this.width = destWidth;
        this.height = destHeight;

        this.halfWidth = destWidth * 0.5;
        this.halfHeight = destHeight * 0.5;

        this.centerX = Math.floor(destWidth / 2);
        this.centerY = Math.floor(destHeight / 2);

        return this.updateUVs();
    },

    setCut: function (x, y, width, height)
    {
        this.cutX = x;
        this.cutY = y;

        this.cutWidth = width;
        this.cutHeight = height;

        return this.updateUVs();
    },

    /**
    * Updates the internal WebGL UV cache and the drawImage cache.
    *
    * @method updateUVs
    * @private
    */
    updateUVs: function ()
    {
        //  Canvas data

        var cd = this.data.drawImage;

        cd.sWidth = this.cutWidth;
        cd.sHeight = this.cutHeight;
        cd.dWidth = this.cutWidth;
        cd.dHeight = this.cutHeight;

        //  WebGL data

        var tw = this.source.width;
        var th = this.source.height;
        var uvs = this.data.uvs;
        
        uvs.x0 = this.cutX / tw;
        uvs.y0 = this.cutY / th;

        uvs.x1 = this.cutX / tw;
        uvs.y1 = (this.cutY + this.cutHeight) / th;

        uvs.x2 = (this.cutX + this.cutWidth) / tw;
        uvs.y2 = (this.cutY + this.cutHeight) / th;

        uvs.x3 = (this.cutX + this.cutWidth) / tw;
        uvs.y3 = this.cutY / th;

        return this;
    },

    /**
    * Updates the internal WebGL UV cache.
    *
    * @method updateUVsInverted
    * @private
    */
    updateUVsInverted: function ()
    {
        var tw = this.source.width;
        var th = this.source.height;
        var uvs = this.data.uvs;
        
        uvs.x3 = (this.cutX + this.cutHeight) / tw;
        uvs.y3 = (this.cutY + this.cutWidth) / th;

        uvs.x2 = this.cutX / tw;
        uvs.y2 = (this.cutY + this.cutWidth) / th;
        
        uvs.x1 = this.cutX / tw;
        uvs.y1 = this.cutY / th;
        
        uvs.x0 = (this.cutX + this.cutHeight) / tw;
        uvs.y0 = this.cutY / th;

        return this;
    },

    clone: function ()
    {
        var clone = new Frame(this.texture, this.name, this.sourceIndex);

        clone.cutX = this.cutX;
        clone.cutY = this.cutY;
        clone.cutWidth = this.cutWidth;
        clone.cutHeight = this.cutHeight;

        clone.x = this.x;
        clone.y = this.y;

        clone.width = this.width;
        clone.height = this.height;

        clone.halfWidth = this.halfWidth;
        clone.halfHeight = this.halfHeight;

        clone.centerX = this.centerX;
        clone.centerY = this.centerY;

        clone.rotated = this.rotated;

        clone.data = Extend(true, clone.data, this.data);

        clone.updateUVs();

        return clone;
    },

    destroy: function ()
    {
    },

    /**
    * The width of the Frame in its un-trimmed, un-padded state, as prepared in the art package,
    * before being packed.
    *
    * @name Phaser.TextureFrame#realWidth
    * @property {any} realWidth
    */
    realWidth: {

        get: function ()
        {
            return this.data.sourceSize.w;
        }

    },

    /**
    * The height of the Frame in its un-trimmed, un-padded state, as prepared in the art package,
    * before being packed.
    *
    * @name Phaser.TextureFrame#realHeight
    * @property {any} realHeight
    */
    realHeight: {

        get: function ()
        {
            return this.data.sourceSize.h;
        }

    },

    /**
    * UVs
    *
    * @name Phaser.TextureFrame#uvs
    * @property {Object} uvs
    */
    uvs: {

        get: function ()
        {
            return this.data.uvs;
        }

    },

    /**
    * The radius of the Frame (derived from sqrt(w * w + h * h) / 2)
    * @name Phaser.TextureFrame#radius
    * @property {number} radius
    */
    radius: {

        get: function ()
        {
            return this.data.radius;
        }

    },

    /**
    * Is the Frame trimmed?
    * @name Phaser.TextureFrame#trimmed
    * @property {boolean} trimmed
    */
    trimmed: {

        get: function ()
        {
            return this.data.trim;
        }

    },

    /**
    * Canvas Draw Image data
    *
    * @name Phaser.TextureFrame#canvasData
    * @property {Object} canvasData
    */
    canvasData: {

        get: function ()
        {
            return this.data.drawImage;
        }

    }

});

module.exports = Frame;
