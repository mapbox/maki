'use strict';

var BufferShim = require('../buffer'),
    test = require('tap').test;

/*eslint comma-spacing: 0*/

function toArray(buf) {
    var arr = [];
    for (var i = 0; i < buf.length; i++) {
        arr.push(buf[i]);
    }
    return arr;
}

test('empty buffer', function(t) {
    var buf = new BufferShim();
    t.equal(buf.length, 0);
    t.end();
});

test('isBuffer', function(t) {
    var buf = new BufferShim();
    t.equal(BufferShim.isBuffer(buf), true);
    t.equal(BufferShim.isBuffer([1, 2, 3]), false);
    t.equal(BufferShim.isBuffer(new BufferShim([1, 2, 3])), true);
    t.end();
});

test('writeUInt32LE', function(t) {
    var shim = new BufferShim(8);
    shim.writeUInt32LE(12562, 0);
    shim.writeUInt32LE(555, 4);

    t.same(toArray(shim), [18,49,0,0,43,2,0,0]);
    t.end();
});

test('readUInt32LE', function(t) {
    var shim = new BufferShim(8);
    shim.writeUInt32LE(12562, 0);
    shim.writeUInt32LE(555, 4);

    t.same([shim.readUInt32LE(0), shim.readUInt32LE(4)], [12562, 555]);
    t.end();
});

test('readInt32LE', function(t) {
    var shim = new BufferShim(8);
    shim.writeInt32LE(12562, 0);
    shim.writeInt32LE(-555, 4);

    t.same([shim.readInt32LE(0), shim.readInt32LE(4)], [12562, -555]);
    t.end();
});

test('writeFloatLE', function(t) {
    var shim = new BufferShim(4);
    shim.writeFloatLE(123.456, 0);

    t.same(toArray(shim), [121,233,246,66]);
    t.end();
});

test('readFloatLE', function(t) {
    var shim = new BufferShim(4);
    shim.writeFloatLE(123.456, 0);

    t.ok(Math.round(shim.readFloatLE(0) * 1000) / 1000, 123.456);
    t.end();
});

test('writeDoubleLE', function(t) {
    var shim = new BufferShim(8);
    shim.writeDoubleLE(123.4567890123456789, 0);

    t.same(toArray(shim), [153,76,251,7,60,221,94,64]);
    t.end();
});

test('readDoubleLE', function(t) {
    var shim = new BufferShim(8);
    shim.writeDoubleLE(123.4567890123456789, 0);

    t.ok(Math.round(shim.readDoubleLE(0) * 1e16) / 1e16, 123.4567890123456789);
    t.end();
});

var testStr = 'Привет 李小龙',
    testBytes = [208,159,209,128,208,184,208,178,208,181,209,130,32,230,157,142,229,176,143,233,190,153];

test('write', function(t) {
    var shim = new BufferShim(22);
    shim.write(testStr, 0);

    t.same(toArray(shim), testBytes);
    t.end();
});

test('toString', function(t) {
    var shim = new BufferShim(22);
    shim.write(testStr, 0);

    t.same(shim.toString(), testStr);
    t.end();
});

test('more complicated utf8', function(t) {
    var shim = new BufferShim(100);
    // crazy test from github.com/mathiasbynens/utf8.js
    var str = '\uDC00\uDC00\uDC00\uDC00A\uDC00\uD834\uDF06\uDC00\uDEEE\uDFFF\uD800\uDC00\uD800\uD800\uD800\uD800A' +
        '\uD800\uD834\uDF06';
    var len = BufferShim.byteLength(str);
    shim.write(str, 0);
    var str2 = shim.toString('utf8', 0, len);
    t.same(new Buffer(str2), new Buffer(str));
    t.end();
});

test('wrap', function(t) {
    var arr = new Uint8Array(testBytes);
    var shim = new BufferShim(arr);

    t.same(shim.toString(), testStr);
    t.end();
});

test('byteLength', function(t) {
    t.same(BufferShim.byteLength(testStr), 22);
    t.end();
});

test('copy', function(t) {
    var shim = new BufferShim(new Uint8Array(testBytes));
    var shim2 = new BufferShim(22);

    shim.copy(shim2);

    t.same(toArray(shim), toArray(shim2));
    t.end();
});

test('slice', function(t) {
    var shim = new BufferShim(new Uint8Array(testBytes));
    t.same(toArray(shim.slice(0, 2)), [208, 159]);
    t.end();
});
