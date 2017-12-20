var Base64Decode = require('./Base64Decode');
var GetFastValue = require('../../../../utils/object/GetFastValue');
var LayerData = require('../../mapdata/LayerData');
var ParseGID = require('./ParseGID');
var Tile = require('../../Tile');

var ParseTileLayers = function (json, insertNull)
{
    var tileLayers = [];

    for (var i = 0; i < json.layers.length; i++)
    {
        if (json.layers[i].type !== 'tilelayer')
        {
            continue;
        }

        var curl = json.layers[i];

        // Base64 decode data if necessary. NOTE: uncompressed base64 only.
        if (curl.compression)
        {
            console.warn(
                'TilemapParser.parseTiledJSON - Layer compression is unsupported, skipping layer \''
                + curl.name + '\''
            );
            continue;
        }
        else if (curl.encoding && curl.encoding === 'base64')
        {
            curl.data = Base64Decode(curl.data);
            delete curl.encoding; // Allow the same map to be parsed multiple times
        }

        var layerData = new LayerData({
            name: curl.name,
            x: GetFastValue(curl, 'offsetx', 0) + curl.x,
            y: GetFastValue(curl, 'offsety', 0) + curl.y,
            width: curl.width,
            height: curl.height,
            tileWidth: json.tilewidth,
            tileHeight: json.tileheight,
            alpha: curl.opacity,
            visible: curl.visible,
            properties: GetFastValue(curl, 'properties', {})
        });

        var x = 0;
        var row = [];
        var output = [];

        //  Loop through the data field in the JSON.

        //  This is an array containing the tile indexes, one after the other. -1 = no tile,
        //  everything else = the tile index (starting at 1 for Tiled, 0 for CSV) If the map
        //  contains multiple tilesets then the indexes are relative to that which the set starts
        //  from. Need to set which tileset in the cache = which tileset in the JSON, if you do this
        //  manually it means you can use the same map data but a new tileset.

        for (var t = 0, len = curl.data.length; t < len; t++)
        {
            var gidInfo = ParseGID(curl.data[t]);

            //  index, x, y, width, height
            if (gidInfo.gid > 0)
            {
                var tile = new Tile(layerData, gidInfo.gid, x, output.length, json.tilewidth,
                    json.tileheight);

                tile.rotation = gidInfo.rotation;
                tile.flipped = gidInfo.flipped;
                tile.flippedHorizontal = gidInfo.flippedHorizontal;
                tile.flippedVertical = gidInfo.flippedVertical;
                tile.flippedAntiDiagonal = gidInfo.flippedAntiDiagonal;

                row.push(tile);
            }
            else
            {
                var blankTile = insertNull
                    ? null
                    : new Tile(layerData, -1, x, output.length, json.tilewidth, json.tileheight);
                row.push(blankTile);
            }

            x++;

            if (x === curl.width)
            {
                output.push(row);
                x = 0;
                row = [];
            }
        }

        layerData.data = output;

        tileLayers.push(layerData);
    }

    return tileLayers;
};

module.exports = ParseTileLayers;
