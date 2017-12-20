var GameObject = require('../GameObject');

var SpriteCanvasRenderer = function (renderer, src, interpolationPercentage, camera)
{
    if (GameObject.RENDER_MASK !== src.renderFlags || (src.cameraFilter > 0 && (src.cameraFilter & camera._id)))
    {
        return;
    }

    renderer.drawImage(src, camera);
};

module.exports = SpriteCanvasRenderer;
