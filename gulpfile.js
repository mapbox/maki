var pathlib = require('path');
var gulp = require('gulp');
var Spritesmith = require('gulp.spritesmith');
var handlebars = require('handlebars');
var insert = require('gulp-insert');
var merge = require('merge-stream');
var renderSdf = require('./sdf-render');
var rename = require('gulp-rename');
var shell = require('gulp-shell');

// TODO could enable filtering based on maki.json
//var makiData = require('./www/maki.json');

handlebars.registerHelper("darkpath", function(pathStr) {
  if (!pathStr) {
    return pathStr;
  }

  var p = pathlib.parse(pathStr);
  p.base = "dark-" + p.base;
  return pathlib.format(p);
});

gulp.task('render-sdf', function() {
  return gulp.src('src/*-24.svg')
    .pipe(renderSdf())
    .pipe(rename(function(p) {
      p.basename = p.basename.match(/(.*)-24/)[1]; 
      p.extname = '.png';
    }))
    .pipe(gulp.dest('testout/sdf'));
});

gulp.task('render-png', function() {
  function opts(highres) {
    return {
      templateData: {
        dpi: function() { return highres ? 180 : 90; },
        outputPath: function(p) {
          var p = pathlib.parse(p);
          var name = highres ? p.name + '@2x' : p.name;
          return __dirname + "/renders/" + name + ".png";
        },
      }
    };
  }

  var cmd = 'inkscape '
  + '--export-dpi=<%= dpi() %> '
  + '--export-png=<%= outputPath(file.path) %> '
  + '<%= file.path %>'
  + '> /dev/null';

  var a = gulp.src('src/*.svg', {read: false})
    .pipe(shell(cmd, opts(false)));

  var b = gulp.src('src/*.svg', {read: false})
    .pipe(shell(cmd, opts(true)));

  return merge(a, b);
});

gulp.task('sprite-sdf', function() {

  // "css" isn't appropriate here, since the output will be JSON
  // but this is how gulp.spritesmith does it.

  var ss = Spritesmith({
    imgName: 'images/maki-sdf-sprite.png',
    cssName: 'maki-sdf-sprite.json',
    cssTemplate: function(data) {
      var result = {};
      data.sprites.forEach(function(sprite) {
        result[sprite.name] = {
          x: sprite.x,
          y: sprite.y,
          width: sprite.width,
          height: sprite.height,
          pixelRatio: 1,
          sdf: true,
        };
      });
      return JSON.stringify(result);
    },
  });

  return gulp.src('sdf/*.png')
    .pipe(ss)
    .pipe(gulp.dest('testout'));
});


gulp.task('sprite', function() {
  var ss = Spritesmith({
    imgName: 'images/maki-sprite.png',
    retinaSrcFilter: ['renders/*@2x.png'],
    retinaImgName: 'images/maki-sprite@2x.png',
    cssName: 'maki-sprite.css',
    cssTemplate: './www/maki-sprite.css.tpl',
  });
  var spriteData = gulp.src('renders/*.png').pipe(ss);

  var cssData = spriteData.css
    .pipe(insert.prepend("/* This is a generated file. */\n\n"));

  return merge(spriteData.img, cssData)
    .pipe(gulp.dest('testout'));
});
