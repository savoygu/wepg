var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var pump = require('pump');
// var sourcemaps = require('gulp-sourcemaps');
var rollup = require('gulp-better-rollup');
var babel = require('rollup-plugin-babel');
// var uglify = require('rollup-plugin-uglify').uglify;
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var minimist = require('minimist');

var paths = {
  baseDIR: 'packages',
  genTypedDIR: function(name, type)  {
    return 'packages/' + name + '/' + type;
  }
};

var knownOptions = {
  string:' name'
};

var options = minimist(process.argv.slice(2), knownOptions);

function createPipe(pluginDIR, config) {
  var min = config.env === 'production';
  var next = gulp.src(path.join(pluginDIR, 'src/index.js'))
    // .pipe(sourcemaps.write())
    .pipe(rollup({
      plugins: [
        babel({
          exclude: 'node_modules/**'
        }),
        // min &&
        //   uglify({
        //     compress: {
        //       pure_getters: true,
        //       unsafe: true,
        //       unsafe_comps: true,
        //       warnings: false
        //     }
        //   })
      ].filter(Boolean)
    }, config.output));

  if (min) {
    next = next.pipe(uglify());
  }
  // next = next.pipe(sourcemaps.write());
  next.pipe(gulp.dest(path.join(pluginDIR, 'dist')));
}

function generate$File(name, type) {
  var pluginDIR = paths.genTypedDIR(name, type);
  pump([
    gulp.src(path.join(pluginDIR, 'src/index.js')),
    rename(function (path) {
      path.basename = name;
    }),
    gulp.dest(path.join(pluginDIR, 'dist'))
  ], function () {
    pump([
      gulp.src(path.join(pluginDIR, 'dist/' + name + '.js')),
      uglify(),
      rename(function (path) {
        path.extname = '.min.js';
      }),
      gulp.dest(path.join(pluginDIR, 'dist'))
    ]);
  });
}

function generateNativeFile(name, type) {
  var pluginDIR = paths.genTypedDIR(name, type);
  var pkg = require('./packages/' + name + '/' + type + '/package.json');
  var configs = {
    regular_umd: {
      output: { file: pkg.main, format: 'umd', name: pkg.moduleName }
    },
    regular_esm: {
      output: { file: pkg['jsnext:main'],  format: 'es' }
    },
    umd_prod: {
      output: { file: pkg.unpkg, format: 'umd', name: pkg.moduleName },
      env: 'production'
    },
  };
  var buildTypes = Object.keys(configs);
  buildTypes.map(function (buildType) {
    return createPipe(pluginDIR, configs[buildType]);
  });
}

function buildPlugins(type, name) {
  if (name) { // 开发原生插件
    return generateNativeFile(name, type);
  }

  fs.readdirSync(paths.baseDIR)
    .filter(function(name) { return name.indexOf('.') === -1; })
    .map(function(pluginName) {
      return type === 'native' ? generateNativeFile(pluginName, type) : generate$File(pluginName, type);
    });
}

gulp.task('serve', ['build:native'], function() {
  browserSync.init({
    server: './packages/' + options.name + '/native'
  });

  gulp.watch('./packages/' + options.name + '/native/src/*.js', ['build:native']);
  gulp.watch(['./packages/' + options.name + '/native/**/*.*']).on('change', reload);
});

gulp.task('build:$', function() {
  buildPlugins('$');
});

gulp.task('build:native', function() {
  buildPlugins('native', options.name);
});

gulp.task('build', ['build:$', 'build:native'], function() {
  console.log('build success'); // eslint-disable-line
});

gulp.task('default', ['serve']);
