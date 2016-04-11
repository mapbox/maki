'use strict';

// lightweight Buffer shim for pbf browser build
// based on code from github.com/feross/buffer (MIT-licensed)

module.exports = Buffer;

var ieee754 = require('ieee754');

var BufferMethods;

function Buffer(length) {
    var arr;
    if (length && length.length) {
        arr = length;
        length = arr.length;
    }
    var buf = new Uint8Array(length || 0);
    if (arr) buf.set(arr);

    buf.readUInt32LE = BufferMethods.readUInt32LE;
    buf.writeUInt32LE = BufferMethods.writeUInt32LE;
    buf.readInt32LE = BufferMethods.readInt32LE;
    buf.writeInt32LE = BufferMethods.writeInt32LE;
    buf.readFloatLE = BufferMethods.readFloatLE;
    buf.writeFloatLE = BufferMethods.writeFloatLE;
    buf.readDoubleLE = BufferMethods.readDoubleLE;
    buf.writeDoubleLE = BufferMethods.writeDoubleLE;
    buf.toString = BufferMethods.toString;
    buf.write = BufferMethods.write;
    buf.slice = BufferMethods.slice;
    buf.copy = BufferMethods.copy;

    buf._isBuffer = true;
    return buf;
}

var lastStr, lastStrEncoded;

BufferMethods = {
    readUInt32LE: function(pos) {
        return ((this[pos]) |
            (this[pos + 1] << 8) |
            (this[pos + 2] << 16)) +
            (this[pos + 3] * 0x1000000);
    },

    writeUInt32LE: function(val, pos) {
        this[pos] = val;
        this[pos + 1] = (val >>> 8);
        this[pos + 2] = (val >>> 16);
        this[pos + 3] = (val >>> 24);
    },

    readInt32LE: function(pos) {
        return ((this[pos]) |
            (this[pos + 1] << 8) |
            (this[pos + 2] << 16)) +
            (this[pos + 3] << 24);
    },

    readFloatLE:  function(pos) { return ieee754.read(this, pos, true, 23, 4); },
    readDoubleLE: function(pos) { return ieee754.read(this, pos, true, 52, 8); },

    writeFloatLE:  function(val, pos) { return ieee754.write(this, val, pos, true, 23, 4); },
    writeDoubleLE: function(val, pos) { return ieee754.write(this, val, pos, true, 52, 8); },

    toString: function(encoding, start, end) {
        var str = '',
            tmp = '';

        start = start || 0;
        end = Math.min(this.length, end || this.length);

        for (var i = start; i < end; i++) {
            var ch = this[i];
            if (ch <= 0x7F) {
                str += decodeURIComponent(tmp) + String.fromCharCode(ch);
                tmp = '';
            } else {
                tmp += '%' + ch.toString(16);
            }
        }

        str += decodeURIComponent(tmp);

        return str;
    },

    write: function(str, pos) {
        var bytes = str === lastStr ? lastStrEncoded : encodeString(str);
        for (var i = 0; i < bytes.length; i++) {
            this[pos + i] = bytes[i];
        }
    },

    slice: function(start, end) {
        return this.subarray(start, end);
    },

    copy: function(buf, pos) {
        pos = pos || 0;
        for (var i = 0; i < this.length; i++) {
            buf[pos + i] = this[i];
        }
    }
};

BufferMethods.writeInt32LE = BufferMethods.writeUInt32LE;

Buffer.byteLength = function(str) {
    lastStr = str;
    lastStrEncoded = encodeString(str);
    return lastStrEncoded.length;
};

Buffer.isBuffer = function(buf) {
    return !!(buf && buf._isBuffer);
};

function encodeString(str) {
    var length = str.length,
        bytes = [];

    for (var i = 0, c, lead; i < length; i++) {
        c = str.charCodeAt(i); // code point

        if (c > 0xD7FF && c < 0xE000) {

            if (lead) {
                if (c < 0xDC00) {
                    bytes.push(0xEF, 0xBF, 0xBD);
                    lead = c;
                    continue;

                } else {
                    c = lead - 0xD800 << 10 | c - 0xDC00 | 0x10000;
                    lead = null;
                }

            } else {
                if (c > 0xDBFF || (i + 1 === length)) bytes.push(0xEF, 0xBF, 0xBD);
                else lead = c;

                continue;
            }

        } else if (lead) {
            bytes.push(0xEF, 0xBF, 0xBD);
            lead = null;
        }

        if (c < 0x80) bytes.push(c);
        else if (c < 0x800) bytes.push(c >> 0x6 | 0xC0, c & 0x3F | 0x80);
        else if (c < 0x10000) bytes.push(c >> 0xC | 0xE0, c >> 0x6 & 0x3F | 0x80, c & 0x3F | 0x80);
        else bytes.push(c >> 0x12 | 0xF0, c >> 0xC & 0x3F | 0x80, c >> 0x6 & 0x3F | 0x80, c & 0x3F | 0x80);
    }
    return bytes;
}
