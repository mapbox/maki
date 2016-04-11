About
========
Simple PNG encoder/decoder for Node.js with no native dependencies.

Installation
===============
```
$ npm install pngjs
```

Example
==========
```js
var fs = require('fs'),
    PNG = require('pngjs').PNG;

fs.createReadStream('in.png')
    .pipe(new PNG({
        filterType: 4
    }))
    .on('parsed', function() {

        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var idx = (this.width * y + x) << 2;

                // invert color
                this.data[idx] = 255 - this.data[idx];
                this.data[idx+1] = 255 - this.data[idx+1];
                this.data[idx+2] = 255 - this.data[idx+2];

                // and reduce opacity
                this.data[idx+3] = this.data[idx+3] >> 1;
            }
        }

        this.pack().pipe(fs.createWriteStream('out.png'));
    });
```
For more examples see `examples` folder.

Documentation
================

As input any color type is accepted (grayscale, rgb, palette, grayscale with alpha, rgb with alpha) but 8 bit per sample (channel) is the only supported bit depth. Interlaced mode is not supported.

### Supported ancillary chunks
- `gAMA` - gamma,
- `tRNS` - transparency (but only for paletted image)


## Class: PNG
`PNG` is readable and writable `Stream`.


### Options
- `width` - use this with `height` if you want to create png from scratch
- `height` - as above
- `checkCRC` - whether parser should be strict about checksums in source stream (default: `true`)
- `deflateChunkSize` - chunk size used for deflating data chunks, this should be power of 2 and must not be less than 256 and more than 32*1024 (default: 32 kB)
- `deflateLevel` - compression level for delate (default: 9)
- `deflateStrategy` - compression strategy for delate (default: 3)
- `filterType` - png filtering method for scanlines (default: -1 => auto, accepts array of numbers 0-4)


### Event "metadata"
`function(metadata) { }`
Image's header has been parsed, metadata contains this information:
- `width` image size in pixels
- `height` image size in pixels
- `palette` image is paletted
- `color` image is not grayscale
- `alpha` image contains alpha channel


### Event: "parsed"
`function(data) { }`
Input image has been completly parsed, `data` is complete and ready for modification.


### Event: "error"
`function(error) { }`


### png.parse(data, [callback])
Parses PNG file data. Alternatively you can stream data to instance of PNG.

Optional `callback` is once called on `error` or `parsed`. The callback gets
two arguments `(err, data)`.

Returns `this` for method chaining.


### png.pack()
Starts converting data to PNG file Stream.

Returns `this` for method chaining.


### png.bitblt(dst, sx, sy, w, h, dx, dy)
Helper for image manipulation, copies rectangle of pixels from current image (`sx`, `sy`, `w`, `h`) to `dst` image (at `dx`, `dy`).

Returns `this` for method chaining.


### Property: width
Width of image in pixels


### Property: height
Height of image in pixels


### Property: data
Buffer of image pixel data. Every pixel consists 4 bytes: R, G, B, A (opacity).


### Property: gamma
Gamma of image (0 if not specified)

Changelog
============

### 0.4.0 - Jun 05 2013
  - fixed reading of destroyed input stream

### 0.4.0-alpha - 29 Nov 2012
  - added zlib deflateStrategy option, default to Z_RLE (by pdpotter)
  - added possibility to use multiple filters (by pdpotter, modified by niegowski)

### 0.3.0-alpha - 23 Aug 2012
  - Processing data as Streams, not complete Buffers of data

### 0.2.0-alpha - 21 Aug 2012
  - Input added palette, grayscale, no alpha support
  - Better scanline filter selection

### 0.1.0-alpha - 19 Aug 2012
  - First version

License
=========

(The MIT License)

Copyright (c) 2012 Kuba Niegowski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
