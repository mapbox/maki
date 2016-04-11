// Copyright (c) 2012 Kuba Niegowski
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';


var util = require('util'),
    Stream = require('stream');


var ChunkStream = module.exports = function() {
    Stream.call(this);

    this._buffers = [];
    this._buffered = 0;

    this._reads = [];
    this._paused = false;

    this._encoding = 'utf8';
    this.writable = true;
};
util.inherits(ChunkStream, Stream);


ChunkStream.prototype.read = function(length, callback) {

    this._reads.push({
        length: Math.abs(length),  // if length < 0 then at most this length
        allowLess: length < 0,
        func: callback
    });

    this._process();

    // its paused and there is not enought data then ask for more
    if (this._paused && this._reads.length > 0) {
        this._paused = false;

        this.emit('drain');
    }
};

ChunkStream.prototype.write = function(data, encoding) {

    if (!this.writable) {
        this.emit('error', new Error('Stream not writable'));
        return false;
    }

    if (!Buffer.isBuffer(data))
        data = new Buffer(data, encoding || this._encoding);

    this._buffers.push(data);
    this._buffered += data.length;

    this._process();

    // ok if there are no more read requests
    if (this._reads && this._reads.length == 0)
        this._paused = true;

    return this.writable && !this._paused;
};

ChunkStream.prototype.end = function(data, encoding) {

    if (data) this.write(data, encoding);

    this.writable = false;

    // already destroyed
    if (!this._buffers) return;

    // enqueue or handle end
    if (this._buffers.length == 0) {
        this._end();
    } else {
        this._buffers.push(null);
        this._process();
    }
};

ChunkStream.prototype.destroySoon = ChunkStream.prototype.end;

ChunkStream.prototype._end = function() {

    if (this._reads.length > 0) {
        this.emit('error',
            new Error('There are some read requests waitng on finished stream')
        );
    }

    this.destroy();
};

ChunkStream.prototype.destroy = function() {

    if (!this._buffers) return;

    this.writable = false;
    this._reads = null;
    this._buffers = null;

    this.emit('close');
};

ChunkStream.prototype._process = function() {

    // as long as there is any data and read requests
    while (this._buffered > 0 && this._reads && this._reads.length > 0) {

        var read = this._reads[0];

        // read any data (but no more than length)
        if (read.allowLess) {

            // ok there is any data so that we can satisfy this request
            this._reads.shift(); // == read

            // first we need to peek into first buffer
            var buf = this._buffers[0];

            // ok there is more data than we need
            if (buf.length > read.length) {

                this._buffered -= read.length;
                this._buffers[0] = buf.slice(read.length);

                read.func.call(this, buf.slice(0, read.length));

            } else {
                // ok this is less than maximum length so use it all
                this._buffered -= buf.length;
                this._buffers.shift(); // == buf

                read.func.call(this, buf);
            }

        } else if (this._buffered >= read.length) {
            // ok we can meet some expectations

            this._reads.shift(); // == read

            var pos = 0,
                count = 0,
                data = new Buffer(read.length);

            // create buffer for all data
            while (pos < read.length) {

                var buf = this._buffers[count++],
                    len = Math.min(buf.length, read.length - pos);

                buf.copy(data, pos, 0, len);
                pos += len;

                // last buffer wasn't used all so just slice it and leave
                if (len != buf.length)
                    this._buffers[--count] = buf.slice(len);
            }

            // remove all used buffers
            if (count > 0)
                this._buffers.splice(0, count);

            this._buffered -= read.length;

            read.func.call(this, data);

        } else {
            // not enought data to satisfy first request in queue
            // so we need to wait for more
            break;
        }
    }

    if (this._buffers && this._buffers.length > 0 && this._buffers[0] == null) {
        this._end();
    }
};
