var Commands = require('./Commands');
var GameObject = require('../GameObject');
var TransformMatrix = require('../components/TransformMatrix');

var cos = Math.cos;
var sin = Math.sin;

var currentMatrix = new TransformMatrix();
var matrixStack = new Float32Array(6 * 1000);
var matrixStackLength = 0;
var pathArray = [];
var tempMatrix = new TransformMatrix();

var Point = function (x, y, width, rgb, alpha)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.rgb = rgb;
    this.alpha = alpha;
};

var Path = function (x, y, width, rgb, alpha)
{
    this.points = [];
    this.pointsLength = 1;
    this.points[0] = new Point(x, y, width, rgb, alpha);
};

var GraphicsWebGLRenderer = function (renderer, gameObject, interpolationPercentage, camera, forceRenderTarget)
{
    if (GameObject.RENDER_MASK !== gameObject.renderFlags || (gameObject.cameraFilter > 0 && (gameObject.cameraFilter & camera._id)))
    {
        return;
    }

    var renderTarget = forceRenderTarget || gameObject.renderTarget;
    var shapeBatch = renderer.shapeBatch;
    var cameraScrollX = camera.scrollX * gameObject.scrollFactorX;
    var cameraScrollY = camera.scrollY * gameObject.scrollFactorY;
    var srcX = gameObject.x - cameraScrollX;
    var srcY = gameObject.y - cameraScrollY;
    var srcScaleX = gameObject.scaleX;
    var srcScaleY = gameObject.scaleY;
    var srcRotation = -gameObject.rotation;
    var commandBuffer = gameObject.commandBuffer;
    var lineAlpha = 1.0;
    var fillAlpha = 1.0;
    var lineColor = 0;
    var fillColor = 0;
    var lineWidth = 1.0;
    var cameraMatrix = camera.matrix.matrix;
    var lastPath = null;
    var iteration = 0;
    var iterStep = 0.01;
    var tx = 0;
    var ty = 0;
    var ta = 0;
    var x, y, radius, startAngle, endAngle, anticlockwise;
    var path;
    var tempMatrixMatrix = tempMatrix.matrix;
    var sra, srb, src, srd, sre, srf, cma, cmb, cmc, cmd, cme, cmf;
    var mva, mvb, mvc, mvd, mve, mvf;

    tempMatrix.applyITRS(srcX, srcY, srcRotation, srcScaleX, srcScaleY);

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

    renderer.setRenderer(shapeBatch, null, renderTarget);

    for (var cmdIndex = 0, cmdLength = commandBuffer.length; cmdIndex < cmdLength; ++cmdIndex)
    {
        cmd = commandBuffer[cmdIndex];

        switch (cmd)
        {
            case Commands.ARC:
                iteration = 0;
                x = commandBuffer[cmdIndex + 1];
                y = commandBuffer[cmdIndex + 2];
                radius = commandBuffer[cmdIndex + 3];
                startAngle = commandBuffer[cmdIndex + 4];
                endAngle = commandBuffer[cmdIndex + 5];
                anticlockwise = commandBuffer[cmdIndex + 6];

                if (anticlockwise)
                {
                    ta = endAngle;
                    endAngle = startAngle;
                    startAngle = -ta;
                }
                
                while (iteration < 1)
                {
                    ta = (endAngle - startAngle) * iteration + startAngle;
                    tx = x + cos(ta) * radius;
                    ty = y + sin(ta) * radius;

                    if (iteration === 0)
                    {
                        lastPath = new Path(tx, ty, lineWidth, lineColor, lineAlpha);
                        pathArray.push(lastPath);
                    }
                    else
                    {
                        lastPath.points.push(new Point(tx, ty, lineWidth, lineColor, lineAlpha));
                    }

                    iteration += iterStep;
                }
                cmdIndex += 6;
                break;

            case Commands.LINE_STYLE:
                lineWidth = commandBuffer[cmdIndex + 1];
                lineColor = commandBuffer[cmdIndex + 2];
                lineAlpha = commandBuffer[cmdIndex + 3];
                cmdIndex += 3;
                break;

            case Commands.FILL_STYLE:
                fillColor = commandBuffer[cmdIndex + 1];
                fillAlpha = commandBuffer[cmdIndex + 2];
                cmdIndex += 2;
                break;

            case Commands.BEGIN_PATH:
                pathArray.length = 0;
                break;

            case Commands.CLOSE_PATH:
                if (lastPath !== null && lastPath.points.length > 0)
                {
                    var firstPoint = lastPath.points[0];
                    var lastPoint = lastPath.points[lastPath.points.length - 1];
                    lastPath.points.push(firstPoint);
                    lastPath = new Path(lastPoint.x, lastPoint.y, lastPoint.width, lastPoint.rgb, lastPoint.alpha);
                    pathArray.push(lastPath);
                }
                break;

            case Commands.FILL_PATH:
                for (var pathArrayIndex = 0, pathArrayLength = pathArray.length;
                    pathArrayIndex < pathArrayLength;
                    ++pathArrayIndex)
                {
                    shapeBatch.addFillPath(
                        /* Graphics Game Object Properties */
                        srcX, srcY, srcScaleX, srcScaleY, srcRotation,
                        /* Rectangle properties */ 
                        pathArray[pathArrayIndex].points,
                        fillColor,
                        fillAlpha,
                        /* Transform */
                        mva, mvb, mvc, mvd, mve, mvf,
                        currentMatrix
                    );
                }
                break;

            case Commands.STROKE_PATH:
                for (var pathArrayIndex = 0, pathArrayLength = pathArray.length;
                    pathArrayIndex < pathArrayLength;
                    ++pathArrayIndex)
                {
                    path = pathArray[pathArrayIndex];
                    shapeBatch.addStrokePath(
                        /* Graphics Game Object Properties */
                        srcX, srcY, srcScaleX, srcScaleY, srcRotation,
                        /* Rectangle properties */ 
                        path.points,
                        lineWidth,
                        lineColor,
                        lineAlpha,
                        /* Transform */
                        mva, mvb, mvc, mvd, mve, mvf,
                        path === this._lastPath,
                        currentMatrix
                    );
                }
                break;
                
            case Commands.FILL_RECT:
                shapeBatch.addFillRect(
                    /* Graphics Game Object Properties */
                    srcX, srcY, srcScaleX, srcScaleY, srcRotation,
                    /* Rectangle properties */ 
                    commandBuffer[cmdIndex + 1],
                    commandBuffer[cmdIndex + 2],
                    commandBuffer[cmdIndex + 3],
                    commandBuffer[cmdIndex + 4],
                    fillColor,
                    fillAlpha,
                    /* Transform */
                    mva, mvb, mvc, mvd, mve, mvf,
                    currentMatrix
                );
             
                cmdIndex += 4;
                break;

            case Commands.FILL_TRIANGLE:
                shapeBatch.addFillTriangle(
                    /* Graphics Game Object Properties */
                    srcX, srcY, srcScaleX, srcScaleY, srcRotation,
                    /* Triangle properties */ 
                    commandBuffer[cmdIndex + 1],
                    commandBuffer[cmdIndex + 2],
                    commandBuffer[cmdIndex + 3],
                    commandBuffer[cmdIndex + 4],
                    commandBuffer[cmdIndex + 5],
                    commandBuffer[cmdIndex + 6],
                    fillColor,
                    fillAlpha,
                    /* Transform */
                    mva, mvb, mvc, mvd, mve, mvf,
                    currentMatrix
                );
                
                cmdIndex += 6;
                break;

            case Commands.STROKE_TRIANGLE:
                shapeBatch.addStrokeTriangle(
                    /* Graphics Game Object Properties */
                    srcX, srcY, srcScaleX, srcScaleY, srcRotation,
                    /* Triangle properties */ 
                    commandBuffer[cmdIndex + 1],
                    commandBuffer[cmdIndex + 2],
                    commandBuffer[cmdIndex + 3],
                    commandBuffer[cmdIndex + 4],
                    commandBuffer[cmdIndex + 5],
                    commandBuffer[cmdIndex + 6],
                    lineWidth,
                    lineColor,
                    lineAlpha,
                    /* Transform */
                    mva, mvb, mvc, mvd, mve, mvf,
                    currentMatrix
                );
                
                cmdIndex += 6;
                break;

            case Commands.LINE_TO:
                if (lastPath !== null)
                {
                    lastPath.points.push(new Point(commandBuffer[cmdIndex + 1], commandBuffer[cmdIndex + 2], lineWidth, lineColor, lineAlpha));
                }
                else
                {
                    lastPath = new Path(commandBuffer[cmdIndex + 1], commandBuffer[cmdIndex + 2], lineWidth, lineColor, lineAlpha);
                    pathArray.push(lastPath);
                }
                cmdIndex += 2;
                break;

            case Commands.MOVE_TO:
                lastPath = new Path(commandBuffer[cmdIndex + 1], commandBuffer[cmdIndex + 2], lineWidth, lineColor, lineAlpha);
                pathArray.push(lastPath);
                cmdIndex += 2;
                break;

            case Commands.LINE_FX_TO:
                if (lastPath !== null)
                {
                    lastPath.points.push(new Point(
                        commandBuffer[cmdIndex + 1],
                        commandBuffer[cmdIndex + 2],
                        commandBuffer[cmdIndex + 3],
                        commandBuffer[cmdIndex + 4],
                        commandBuffer[cmdIndex + 5]
                    ));
                }
                else
                {
                    lastPath = new Path(
                        commandBuffer[cmdIndex + 1],
                        commandBuffer[cmdIndex + 2],
                        commandBuffer[cmdIndex + 3],
                        commandBuffer[cmdIndex + 4],
                        commandBuffer[cmdIndex + 5]
                    );
                    pathArray.push(lastPath);
                }
                cmdIndex += 5;
                break;

            case Commands.MOVE_FX_TO:
                lastPath = new Path(
                    commandBuffer[cmdIndex + 1],
                    commandBuffer[cmdIndex + 2],
                    commandBuffer[cmdIndex + 3],
                    commandBuffer[cmdIndex + 4],
                    commandBuffer[cmdIndex + 5]
                );
                pathArray.push(lastPath);
                cmdIndex += 5;
                break;

            case Commands.SAVE:
                matrixStack[matrixStackLength + 0] = currentMatrix.matrix[0];
                matrixStack[matrixStackLength + 1] = currentMatrix.matrix[1];
                matrixStack[matrixStackLength + 2] = currentMatrix.matrix[2];
                matrixStack[matrixStackLength + 3] = currentMatrix.matrix[3];
                matrixStack[matrixStackLength + 4] = currentMatrix.matrix[4];
                matrixStack[matrixStackLength + 5] = currentMatrix.matrix[5];
                matrixStackLength += 6;
                break;

            case Commands.RESTORE:
                matrixStackLength -= 6;
                currentMatrix.matrix[0] = matrixStack[matrixStackLength + 0];
                currentMatrix.matrix[1] = matrixStack[matrixStackLength + 1];
                currentMatrix.matrix[2] = matrixStack[matrixStackLength + 2];
                currentMatrix.matrix[3] = matrixStack[matrixStackLength + 3];
                currentMatrix.matrix[4] = matrixStack[matrixStackLength + 4];
                currentMatrix.matrix[5] = matrixStack[matrixStackLength + 5];
                break;

            case Commands.TRANSLATE:
                currentMatrix.translate(
                    commandBuffer[cmdIndex + 1],
                    commandBuffer[cmdIndex + 2]
                );
                cmdIndex += 2;
                break;

            case Commands.SCALE:
                currentMatrix.scale(
                    commandBuffer[cmdIndex + 1],
                    commandBuffer[cmdIndex + 2]
                );
                cmdIndex += 2;
                break;

            case Commands.ROTATE:
                currentMatrix.rotate(
                    -commandBuffer[cmdIndex + 1]
                );
                cmdIndex += 1;
                break;

            default:
                console.error('Phaser: Invalid Graphics Command ID ' + cmd);
                break;
        }
    }

    currentMatrix.loadIdentity();
    pathArray.length = 0;
};

module.exports = GraphicsWebGLRenderer;
