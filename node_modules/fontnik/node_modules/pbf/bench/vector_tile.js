'use strict';

// Tile ========================================

var Tile = exports.Tile = {read: readTile, write: writeTile};

Tile.GeomType = {
    "UNKNOWN": 0,
    "POINT": 1,
    "LINESTRING": 2,
    "POLYGON": 3
};

function readTile(pbf, end) {
    return pbf.readFields(readTileField, {"layers": []}, end);
}

function readTileField(tag, tile, pbf) {
    if (tag === 3) tile.layers.push(readLayer(pbf, pbf.readVarint() + pbf.pos));
}

function writeTile(tile, pbf) {
    var i;
    if (tile.layers !== undefined) for (i = 0; i < tile.layers.length; i++) pbf.writeMessage(3, writeLayer, tile.layers[i]);
}

// Value ========================================

Tile.Value = {read: readValue, write: writeValue};

function readValue(pbf, end) {
    return pbf.readFields(readValueField, {}, end);
}

function readValueField(tag, value, pbf) {
    if (tag === 1) value.string_value = pbf.readString();
    else if (tag === 2) value.float_value = pbf.readFloat();
    else if (tag === 3) value.double_value = pbf.readDouble();
    else if (tag === 4) value.int_value = pbf.readVarint64();
    else if (tag === 5) value.uint_value = pbf.readVarint();
    else if (tag === 6) value.sint_value = pbf.readSVarint();
    else if (tag === 7) value.bool_value = pbf.readBoolean();
}

function writeValue(value, pbf) {
    if (value.string_value !== undefined) pbf.writeString(1, value.string_value);
    if (value.float_value !== undefined) pbf.writeFloat(2, value.float_value);
    if (value.double_value !== undefined) pbf.writeDouble(3, value.double_value);
    if (value.int_value !== undefined) pbf.writeVarint(4, value.int_value);
    if (value.uint_value !== undefined) pbf.writeVarint(5, value.uint_value);
    if (value.sint_value !== undefined) pbf.writeSVarint(6, value.sint_value);
    if (value.bool_value !== undefined) pbf.writeBoolean(7, value.bool_value);
}

// Feature ========================================

Tile.Feature = {read: readFeature, write: writeFeature};

function readFeature(pbf, end) {
    var feature = pbf.readFields(readFeatureField, {}, end);
    if (feature.type === undefined) feature.type = "UNKNOWN";
    return feature;
}

function readFeatureField(tag, feature, pbf) {
    if (tag === 1) feature.id = pbf.readVarint();
    else if (tag === 2) feature.tags = pbf.readPackedVarint();
    else if (tag === 3) feature.type = pbf.readVarint();
    else if (tag === 4) feature.geometry = pbf.readPackedVarint();
}

function writeFeature(feature, pbf) {
    if (feature.id !== undefined) pbf.writeVarint(1, feature.id);
    if (feature.tags !== undefined) pbf.writePackedVarint(2, feature.tags);
    if (feature.type !== undefined) pbf.writeVarint(3, feature.type);
    if (feature.geometry !== undefined) pbf.writePackedVarint(4, feature.geometry);
}

// Layer ========================================

Tile.Layer = {read: readLayer, write: writeLayer};

function readLayer(pbf, end) {
    return pbf.readFields(readLayerField, {"features": [], "keys": [], "values": []}, end);
}

function readLayerField(tag, layer, pbf) {
    if (tag === 15) layer.version = pbf.readVarint();
    else if (tag === 1) layer.name = pbf.readString();
    else if (tag === 2) layer.features.push(readFeature(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 3) layer.keys.push(pbf.readString());
    else if (tag === 4) layer.values.push(readValue(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 5) layer.extent = pbf.readVarint();
}

function writeLayer(layer, pbf) {
    if (layer.version !== undefined) pbf.writeVarint(15, layer.version);
    if (layer.name !== undefined) pbf.writeString(1, layer.name);
    var i;
    if (layer.features !== undefined) for (i = 0; i < layer.features.length; i++) pbf.writeMessage(2, writeFeature, layer.features[i]);
    if (layer.keys !== undefined) for (i = 0; i < layer.keys.length; i++) pbf.writeString(3, layer.keys[i]);
    if (layer.values !== undefined) for (i = 0; i < layer.values.length; i++) pbf.writeMessage(4, writeValue, layer.values[i]);
    if (layer.extent !== undefined) pbf.writeVarint(5, layer.extent);
}
