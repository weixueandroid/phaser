var renderWebGL = require('../../utils/NOOP');
var renderCanvas = require('../../utils/NOOP');

if (WEBGL_RENDERER)
{
    renderWebGL = require('./GraphicsWebGLRenderer');

    //  Needed for Graphics.generateTexture
    renderCanvas = require('./GraphicsCanvasRenderer');
}

if (CANVAS_RENDERER)
{
    renderCanvas = require('./GraphicsCanvasRenderer');
}

module.exports = {

    renderWebGL: renderWebGL,
    renderCanvas: renderCanvas

};
