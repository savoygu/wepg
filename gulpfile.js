var fs = require('fs');
var path = require('path');
var gulp = require('gulp');

var paths = {
  baseDIR: 'packages',
  genTypedDIR: function (name, type)  {
    return 'packages/' + name + '/' + type;
  }
};

function getPlugins(path) {
  var names = fs.readdirSync(path);
  return names;
}

function buildPlugins (type) {
  var pluginNames = getPlugins(paths.baseDIR);
  pluginNames = pluginNames.filter(function (name) { return name.indexOf('.') === -1; });

  pluginNames.forEach(function (name) {
    var pluginDIR = paths.genTypedDIR(name, type);
    gulp.src(path.join(pluginDIR, 'src/index.js'))
      .pipe(gulp.dest(path.join(pluginDIR, 'dist')));
  });
}

gulp.task('build:$', function () {
  buildPlugins('$');
});

gulp.task('build:native', function () {
  buildPlugins('native');
});

gulp.task('build', ['build:$', 'build:native'], function () {
  console.log('build success'); // eslint-disable-line
});

gulp.task('default', []);
