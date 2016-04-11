fontnik
=======

Generates [Signed Distance Field](https://en.wikipedia.org/wiki/Signed_distance_function) glyphsets from
OpenType fonts.

As opposed to [node-fontnik](https://github.com/mapbox/node-fontnik), fontnik is pure-JavaScript, and instead
of initially rasterizing fonts, it implements most of the algorithm with data still in vector form.

fontnik is used for the SDF generation phase of [spritenik](https://github.com/mapbox/spritenik), a tool for
generating PBF sprites.
