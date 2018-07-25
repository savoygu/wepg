var fs = require('fs');
var path = require('path');
var gulp = require('gulp');

var paths = {
  baseDIR: 'packages',
  base$DIR: 'packages/$',
  baseNativeDIR: 'packages/native'
};

function getPlugins(path) {
  var names = fs.readdirSync(path);
  return names;
}

function buildPlugins (baseDIR, pluginNames) {
  pluginNames.forEach(function (name) {
    var pluginDIR = baseDIR+ '/' + name;
    gulp.src(path.join(pluginDIR, 'src/index.js'))
      .pipe(gulp.dest(path.join(pluginDIR, 'dist')));
  });
}

gulp.task('build:$', function () {
  buildPlugins(paths.base$DIR, getPlugins(paths.base$DIR));
});

gulp.task('build:native', function () {
  buildPlugins(paths.baseNativeDIR, getPlugins(paths.baseNativeDIR));
});

gulp.task('build', ['build:$', 'build:native'], function () {
  console.log('build success'); // eslint-disable-line
});

gulp.task('default', []);
