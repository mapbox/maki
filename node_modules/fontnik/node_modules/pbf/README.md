# pbf

[![build status](https://secure.travis-ci.org/mapbox/pbf.png)](http://travis-ci.org/mapbox/pbf) [![Coverage Status](https://coveralls.io/repos/mapbox/pbf/badge.png)](https://coveralls.io/r/mapbox/pbf)

A low-level, fast, ultra-lightweight (3KB gzipped) JavaScript library for decoding and encoding [protocol buffers](https://developers.google.com/protocol-buffers) (a compact binary format for structured data serialization).

Designed to be a building block for writing customized decoders and encoders.
If you need an all-purpose protobuf JS library that does most of the work for you,
take a look at [protocol-buffers](https://github.com/mafintosh/protocol-buffers) too.

## Examples

#### Using Compiled Code

Install `pbf` and compile a JavaScript module from a `.proto` file:

```bash
$ npm install -g pbf
$ pbf test.proto > test.js
```

Then read and write objects using the module like this:

```js
var obj = Test.read(new Pbf(buffer)); // read
var buffer = Test.write(obj, new Pbf()); // write
```

#### Custom Reading

```js
var data = new Pbf(buffer).readFields(readData, {});

function readData(tag, data, pbf) {
    if (tag === 1) data.name = pbf.readString();
    else if (tag === 2) data.version = pbf.readVarint();
    else if (tag === 3) data.layer = pbf.readMessage(readLayer, {});
}
function readLayer(tag, layer, pbf) {
    if (tag === 1) layer.name = pbf.readString();
    else if (tag === 3) layer.size = pbf.readVarint();
}
```

#### Custom Writing

```js
var pbf = new Pbf();
writeData(data, pbf);
var buffer = pbf.finish();

function writeData(data, pbf) {
    pbf.writeStringField(1, data.name);
    pbf.writeVarintField(2, data.version);
    pbf.writeMessage(3, writeLayer, data.layer);
}
function writeLayer(layer, pbf) {
    pbf.writeStringField(1, layer.name);
    pbf.writeVarintField(2, layer.size);
}
```


## Install

Node and Browserify:

```bash
npm install pbf
```

Making a browser build:

```bash
npm install
npm run build-dev # dist/pbf-dev.js (development build)
npm run build-min # dist/pbf.js (minified production build)
```

## API

Create a `Pbf` object, optionally given a `Buffer` or `Uint8Array` as input data:

```js
// parse a pbf file from disk in Node
var pbf = new Pbf(fs.readFileSync('data.pbf'));

// parse a pbf file in a browser after an ajax request with responseType="arraybuffer"
var pbf = new Pbf(new Uint8Array(xhr.response));
```

`Pbf` object properties:

```js
pbf.length; // length of the underlying buffer
pbf.pos; // current offset for reading or writing
```

#### Reading

Read a sequence of fields:

```js
pbf.readFields(function (tag) {
    if (tag === 1) pbf.readVarint();
    else if (tag === 2) pbf.readString();
    else ...
});
```

It optionally accepts an object that will be passed to the reading function for easier construction of decoded data,
and also passes the `Pbf` object as a third argument:

```js
var result = pbf.readFields(callback, {})

function callback(tag, result, pbf) {
    if (tag === 1) result.id = pbf.readVarint();
}
```

To read an embedded message, use `pbf.readMessage(fn[, obj])` (in the same way as `read`).

Read values:

```js
var value = pbf.readVarint();
var str = pbf.readString();
var numbers = pbf.readPackedVarint();
```

For lazy or partial decoding, simply save the position instead of reading a value,
then later set it back to the saved value and read:

```js
var fooPos = -1;
pbf.readFields(function (tag) {
    if (tag === 1) fooPos = pbf.pos;
});
...
pbf.pos = fooPos;
pbf.readMessage(readFoo);
```

Scalar reading methods:

* `readVarint()`
* `readSVarint()`
* `readVarint64()` (`readVarint` version that handles negative `int64` values)
* `readFixed32()`
* `readFixed64()`
* `readSFixed32()`
* `readSFixed64()`
* `readBoolean()`
* `readFloat()`
* `readDouble()`
* `readString()`
* `readBytes()`
* `skip(value)`

Packed reading methods:

* `readPackedVarint()`
* `readPackedSVarint()`
* `readPackedFixed32()`
* `readPackedFixed64()`
* `readPackedSFixed32()`
* `readPackedSFixed64()`
* `readPackedBoolean()`
* `readPackedFloat()`
* `readPackedDouble()`

#### Writing

Write values:

```js
pbf.writeVarint(123);
pbf.writeString("Hello world");
```

Write an embedded message:

```js
pbf.writeMessage(1, writeObj, obj);

function writeObj(obj, pbf) {
    pbf.writeStringField(obj.name);
    pbf.writeVarintField(obj.version);
}
```

Field writing methods:

* `writeVarintField(tag, val)`
* `writeSVarintField(tag, val)`
* `writeFixed32Field(tag, val)`
* `writeFixed64Field(tag, val)`
* `writeSFixed32Field(tag, val)`
* `writeSFixed64Field(tag, val)`
* `writeBooleanField(tag, val)`
* `writeFloatField(tag, val)`
* `writeDoubleField(tag, val)`
* `writeStringField(tag, val)`
* `writeBytesField(tag, buffer)`

Packed field writing methods:

* `writePackedVarint(tag, val)`
* `writePackedSVarint(tag, val)`
* `writePackedSFixed32(tag, val)`
* `writePackedSFixed64(tag, val)`
* `writePackedBoolean(tag, val)`
* `writePackedFloat(tag, val)`
* `writePackedDouble(tag, val)`

Scalar writing methods:

* `writeVarint(val)`
* `writeSVarint(val)`
* `writeSFixed32(val)`
* `writeSFixed64(val)`
* `writeBoolean(val)`
* `writeFloat(val)`
* `writeDouble(val)`
* `writeString(val)`
* `writeBytes(buffer)`

Message writing methods:

* `writeMessage(tag, fn[, obj])`
* `writeRawMessage(fn[, obj])`

Misc methods:

* `realloc(minBytes)` - pad the underlying buffer size to accommodate the given number of bytes;
   note that the size increases exponentially, so it won't necessarily equal the size of data written
* `finish()` - make the current buffer ready for reading and return the data as a buffer slice
* `destroy()` - dispose the buffer

For an example of a real-world usage of the library, see [vector-tile-js](https://github.com/mapbox/vector-tile-js).


## Proto Schema to JavaScript

If installed globally, `pbf` provides a binary that compiles `proto` files into JavaScript modules. Usage:

```bash
$ pbf <proto_path> [--no-write] [--no-read] [--browser]
```

The `--no-write` and `--no-read` switches remove corresponding code in the output.
The `--browser` switch makes the module work in browsers instead of Node.

The resulting module exports each message by name with the following methods:

* `read(pbf)` - decodes an object from the given `Pbf` instance
* `write(obj, pbf)` - encodes an object into the given `Pbf` instance (usually empty)

The resulting code is pretty short and easy to understand, so you can customize it easily.


## Changelog

#### 1.3.5 (Oct 5, 2015)

- Added support for `syntax` keyword proto files (by updating `resolve-protobuf-schema` dependency).

#### 1.3.4 (Jul 31, 2015)

- Added `writeRawMessage` method for writing a message without a tag, useful for creating pbfs with multiple top-level messages.

#### 1.3.2 (Mar 5, 2015)

- Added `readVarint64` method for proper decoding of negative `int64`-encoded values.

#### 1.3.1 (Feb 20, 2015)

- Fixed pbf proto compile tool generating broken writing code.

#### 1.3.0 (Feb 5, 2015)

- Added `pbf` binary that compiles `.proto` files into `Pbf`-based JavaScript modules.

#### 1.2.0 (Jan 5, 2015)

##### Breaking API changes

- Changed `writeMessage` signature to `(tag, fn, obj)` (see example in the docs)
  for a huge encoding performance improvement.
- Replaced `readPacked` and `writePacked` methods that accept type as a string
  with `readPackedVarint`, etc. for each type (better performance and simpler API).

##### Improvements

- 5x faster encoding in Node (vector tile benchmark).
- 40x faster encoding and 3x faster decoding in the browser (vector tile benchmark).

#### 1.1.4 (Jan 2, 2015)

- Significantly improved `readPacked` and `writePacked` performance (the tile reading benchmark is now 70% faster).

#### 1.1.3 (Dec 26, 2014)

Brings tons of improvements and fixes over the previous version (`0.0.2`).
Basically makes the library complete.

##### Improvements

- Improved performance of both reading and writing.
- Made the browser build 3 times smaller.
- Added convenience `readFields` and `readMessage` methods for a much easier reading API.
- Added reading methods: `readFloat`, `readBoolean`, `readSFixed32`, `readSFixed64`.
- Added writing methods: `writeUInt64`, `writeSFixed32`, `writeSFixed64`.
- Improved `readDouble` and `readString` to use native Buffer methods under Node.
- Improved `readString` and `writeString` to use HTML5 `TextEncoder` and `TextDecoder` where available.
- Made `Pbf` `buffer` argument optional.
- Added extensive docs and examples in the readme.
- Added an extensive test suite that brings test coverage up to 100%.

##### Breaking API changes

- Renamed `readBuffer`/`writeBuffer` to `readBytes`/`writeBytes`.
- Renamed `readUInt32`/`writeUInt32` to `readFixed32`/`writeFixed32`, etc.
- Renamed `writeTaggedVarint` to `writeVarintField`, etc.
- Changed `writePacked` signature from `(type, tag, items)` to `(tag, type, items)`.

##### Bugfixes

- Fixed `readVarint` to handle varints bigger than 6 bytes.
- Fixed `readSVarint` to handle number bigger than `2^30`.
- Fixed `writeVarint` failing on some integers.
- Fixed `writeVarint` not throwing an error on numbers that are too big.
- Fixed `readUInt64` always failing.
- Fixed writing to an empty buffer always failing.
