var Class = require('../../../../utils/Class');
var CONST = require('./const');
var DataBuffer16 = require('../../utils/DataBuffer16');
var DataBuffer32 = require('../../utils/DataBuffer32');
var PHASER_CONST = require('../../../../const');
var TexturedAndNormalizedTintedShader = require('../../shaders/TexturedAndNormalizedTintedShader');
var TransformMatrix = require('../../../../gameobjects/components/TransformMatrix');

var EffectRenderer = new Class({

    initialize:

    function EffectRenderer (game, gl, manager)
    {
        this.game = game;
        this.type = PHASER_CONST.WEBGL;
        this.view = game.canvas;
        this.resolution = game.config.resolution;
        this.width = game.config.width * game.config.resolution;
        this.height = game.config.height * game.config.resolution;
        this.glContext = gl;
        this.maxSprites = null;
        this.shader = null;
        this.vertexBufferObject = null;
        this.indexBufferObject = null;
        this.vertexDataBuffer = null;
        this.indexDataBuffer = null;
        this.elementCount = 0;
        this.currentTexture2D = null;
        this.viewMatrixLocation = null;
        this.tempMatrix = new TransformMatrix();

        //   All of these settings will be able to be controlled via the Game Config
        this.config = {
            clearBeforeRender: true,
            transparent: false,
            autoResize: false,
            preserveDrawingBuffer: false,

            WebGLContextOptions: {
                alpha: true,
                antialias: true,
                premultipliedAlpha: true,
                stencil: true,
                preserveDrawingBuffer: false
            }
        };

        this.manager = manager;
        this.dirty = false;

        this.init(this.glContext);
    },

    init: function (gl)
    {
        var vertexDataBuffer = new DataBuffer32(CONST.VERTEX_SIZE * CONST.QUAD_VERTEX_COUNT * CONST.MAX_QUADS);
        var indexDataBuffer = new DataBuffer16(CONST.INDEX_SIZE * CONST.QUAD_INDEX_COUNT * CONST.MAX_QUADS);
        var shader = this.manager.resourceManager.createShader('TexturedAndNormalizedTintedShader', TexturedAndNormalizedTintedShader);
        var indexBufferObject = this.manager.resourceManager.createBuffer(gl.ELEMENT_ARRAY_BUFFER, indexDataBuffer.getByteCapacity(), gl.STATIC_DRAW);
        var vertexBufferObject = this.manager.resourceManager.createBuffer(gl.ARRAY_BUFFER, vertexDataBuffer.getByteCapacity(), gl.STREAM_DRAW);
        var viewMatrixLocation = shader.getUniformLocation('u_view_matrix');
        var indexBuffer = indexDataBuffer.uintView;
        var max = CONST.MAX_QUADS * CONST.QUAD_INDEX_COUNT;

        this.vertexDataBuffer = vertexDataBuffer;
        this.indexDataBuffer = indexDataBuffer;
        this.shader = shader;
        this.indexBufferObject = indexBufferObject;
        this.vertexBufferObject = vertexBufferObject;
        this.viewMatrixLocation = viewMatrixLocation;

        vertexBufferObject.addAttribute(shader.getAttribLocation('a_position'), 2, gl.FLOAT, false, CONST.VERTEX_SIZE, 0);
        vertexBufferObject.addAttribute(shader.getAttribLocation('a_tex_coord'), 2, gl.FLOAT, false, CONST.VERTEX_SIZE, 8);
        vertexBufferObject.addAttribute(shader.getAttribLocation('a_color'), 3, gl.UNSIGNED_BYTE, true, CONST.VERTEX_SIZE, 16);
        vertexBufferObject.addAttribute(shader.getAttribLocation('a_alpha'), 1, gl.FLOAT, false, CONST.VERTEX_SIZE, 20);

        // Populate the index buffer only once
        for (var indexA = 0, indexB = 0; indexA < max; indexA += CONST.QUAD_INDEX_COUNT, indexB += CONST.QUAD_VERTEX_COUNT)
        {
            indexBuffer[indexA + 0] = indexB + 0;
            indexBuffer[indexA + 1] = indexB + 1;
            indexBuffer[indexA + 2] = indexB + 2;
            indexBuffer[indexA + 3] = indexB + 0;
            indexBuffer[indexA + 4] = indexB + 2;
            indexBuffer[indexA + 5] = indexB + 3;
        }

        indexBufferObject.updateResource(indexBuffer, 0);

        this.resize(this.width, this.height, this.game.config.resolution);
    },
    
    shouldFlush: function ()
    {
        return false;
    },

    isFull: function ()
    {
        return (this.vertexDataBuffer.getByteLength() >= this.vertexDataBuffer.getByteCapacity());
    },

    bind: function (shader)
    {
        if (!shader)
        {
            this.shader.bind();
        }
        else
        {
            shader.bind();
            this.resize(this.width, this.height, this.game.config.resolution, shader);
        }

        this.indexBufferObject.bind();
        this.vertexBufferObject.bind();
    },

    flush: function (shader, renderTarget)
    {
        var gl = this.glContext;
        var vertexDataBuffer = this.vertexDataBuffer;

        if (this.elementCount === 0)
        {
            return;
        }
        
        if (renderTarget)
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, renderTarget.framebufferObject);
        }

        this.bind(shader);
        this.vertexBufferObject.updateResource(vertexDataBuffer.getUsedBufferAsFloat(), 0);

        gl.drawElements(gl.TRIANGLES, this.elementCount, gl.UNSIGNED_SHORT, 0);

        vertexDataBuffer.clear();

        this.elementCount = 0;

        if (renderTarget)
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
    },

    resize: function (width, height, resolution, shader)
    {
        var activeShader = shader ? shader : this.shader;

        this.width = width * resolution;
        this.height = height * resolution;

        activeShader.setConstantMatrix4x4(
            activeShader.getUniformLocation('u_view_matrix'),
            new Float32Array([
                2 / this.width, 0, 0, 0,
                0, -2 / this.height, 0, 0,
                0, 0, 1, 1,
                -1, 1, 0, 0
            ])
        );
    },

    renderEffect: function (gameObject, camera, texture, textureWidth, textureHeight)
    {
        var tempMatrix = this.tempMatrix;
        var vertexDataBuffer = this.vertexDataBuffer;
        var vertexBufferObjectF32 = vertexDataBuffer.floatView;
        var vertexBufferObjectU32 = vertexDataBuffer.uintView;
        var vertexOffset = 0;
        var width = textureWidth * (gameObject.flipX ? -1 : 1);
        var height = textureHeight * (gameObject.flipY ? -1 : 1);
        var translateX = gameObject.x - camera.scrollX * gameObject.scrollFactorX;
        var translateY = gameObject.y - camera.scrollY * gameObject.scrollFactorY;
        var scaleX = gameObject.scaleX;
        var scaleY = gameObject.scaleY;
        var rotation = -gameObject.rotation;
        var tempMatrixMatrix = tempMatrix.matrix;
        var x = -gameObject.displayOriginX + ((textureWidth) * (gameObject.flipX ? 1 : 0.0));
        var y = -gameObject.displayOriginY + ((textureHeight) * (gameObject.flipY ? 1 : 0.0));
        var xw = x + width;
        var yh = y + height;
        var cameraMatrix = camera.matrix.matrix;
        var mva, mvb, mvc, mvd, mve, mvf, tx0, ty0, tx1, ty1, tx2, ty2, tx3, ty3;
        var sra, srb, src, srd, sre, srf, cma, cmb, cmc, cmd, cme, cmf;
        var alpha = gameObject.alpha;
        var tintTL = gameObject._tintTL;
        var tintTR = gameObject._tintTR;
        var tintBL = gameObject._tintBL;
        var tintBR = gameObject._tintBR;

        tempMatrix.applyITRS(translateX, translateY, rotation, scaleX, scaleY);

        sra = tempMatrixMatrix[0];
        srb = tempMatrixMatrix[1];
        src = tempMatrixMatrix[2];
        srd = tempMatrixMatrix[3];
        sre = tempMatrixMatrix[4];
        srf = tempMatrixMatrix[5];

        cma = cameraMatrix[0];
        cmb = cameraMatrix[1];
        cmc = cameraMatrix[2];
        cmd = cameraMatrix[3];
        cme = cameraMatrix[4];
        cmf = cameraMatrix[5];

        mva = sra * cma + srb * cmc;
        mvb = sra * cmb + srb * cmd;
        mvc = src * cma + srd * cmc;
        mvd = src * cmb + srd * cmd;
        mve = sre * cma + srf * cmc + cme;
        mvf = sre * cmb + srf * cmd + cmf;
        
        tx0 = x * mva + y * mvc + mve;
        ty0 = x * mvb + y * mvd + mvf;
        tx1 = x * mva + yh * mvc + mve;
        ty1 = x * mvb + yh * mvd + mvf;
        tx2 = xw * mva + yh * mvc + mve;
        ty2 = xw * mvb + yh * mvd + mvf;
        tx3 = xw * mva + y * mvc + mve;
        ty3 = xw * mvb + y * mvd + mvf;

        this.manager.setRenderer(this, texture, gameObject.renderTarget);
        vertexOffset = vertexDataBuffer.allocate(24);
        this.elementCount += 6;
        
        //  Top Left
        vertexBufferObjectF32[vertexOffset++] = tx0;
        vertexBufferObjectF32[vertexOffset++] = ty0;
        vertexBufferObjectF32[vertexOffset++] = 0;
        vertexBufferObjectF32[vertexOffset++] = 0;
        vertexBufferObjectU32[vertexOffset++] = tintTL;
        vertexBufferObjectF32[vertexOffset++] = alpha;

        //  Bottom Left
        vertexBufferObjectF32[vertexOffset++] = tx1;
        vertexBufferObjectF32[vertexOffset++] = ty1;
        vertexBufferObjectF32[vertexOffset++] = 0;
        vertexBufferObjectF32[vertexOffset++] = 1;
        vertexBufferObjectU32[vertexOffset++] = tintBL;
        vertexBufferObjectF32[vertexOffset++] = alpha;

        //  Bottom Right
        vertexBufferObjectF32[vertexOffset++] = tx2;
        vertexBufferObjectF32[vertexOffset++] = ty2;
        vertexBufferObjectF32[vertexOffset++] = 1;
        vertexBufferObjectF32[vertexOffset++] = 1;
        vertexBufferObjectU32[vertexOffset++] = tintBR;
        vertexBufferObjectF32[vertexOffset++] = alpha;

        //  Top Right
        vertexBufferObjectF32[vertexOffset++] = tx3;
        vertexBufferObjectF32[vertexOffset++] = ty3;
        vertexBufferObjectF32[vertexOffset++] = 1;
        vertexBufferObjectF32[vertexOffset++] = 0;
        vertexBufferObjectU32[vertexOffset++] = tintTR;
        vertexBufferObjectF32[vertexOffset++] = alpha;

        this.flush(gameObject.dstShader, gameObject.renderTarget);

        gameObject.dstRenderTarget.shouldClear = true;
    },

    destroy: function ()
    {
        this.manager.resourceManager.deleteShader(this.shader);
        this.manager.resourceManager.deleteBuffer(this.indexBufferObject);
        this.manager.resourceManager.deleteBuffer(this.vertexBufferObject);

        this.shader = null;
        this.indexBufferObject = null;
        this.vertexBufferObject = null;
    }

});

module.exports = EffectRenderer;
