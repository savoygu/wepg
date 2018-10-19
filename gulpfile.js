const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const pump = require('pump');
// const sourcemaps = require('gulp-sourcemaps');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
// const uglify = require('rollup-plugin-uglify').uglify;
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const minimist = require('minimist');

const paths = {
  baseDIR: 'packages',
  genTypedDIR: function(name, type)  {
    return 'packages/' + name + '/' + type;
  }
};

const knownOptions = {
  string:' name'
};

const options = minimist(process.argv.slice(2), knownOptions);

const create$Pipe = (pluginDIR, source, name, min) => {
  return [
    gulp.src(path.join(pluginDIR, source)),
    min && uglify(),
    rename(function (path) {
      min ? path.extname = '.min.js' : path.basename = name;
    }),
    gulp.dest(path.join(pluginDIR, 'dist'))
  ].filter(Boolean);
};

const generate$File = (name, type) => {
  const pluginDIR = paths.genTypedDIR(name, type);
  pump(
    create$Pipe(pluginDIR, 'src/index.js', name),
    () => pump(create$Pipe(pluginDIR, 'dist/' + name + '.js', name, true))
  );
};

const createNativePipe = (pluginDIR, config) => {
  const min = config.env === 'production';
  let next = gulp.src(path.join(pluginDIR, 'src/index.js'))
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
};

const generateNativeFile = (name, type) => {
  const pluginDIR = paths.genTypedDIR(name, type);
  const pkg = require('./packages/' + name + '/' + type + '/package.json');
  const configs = {
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
  const buildTypes = Object.keys(configs);
  buildTypes.map(buildType => createNativePipe(pluginDIR, configs[buildType]));
};

const buildPlugins = (type, name) => {
  if (name) { // 开发原生插件
    return generateNativeFile(name, type);
  }

  fs.readdirSync(paths.baseDIR)
    .filter(name => name.indexOf('.') === -1)
    .map(pluginName => (
      type === 'native' ?
        generateNativeFile(pluginName, type) :
        generate$File(pluginName, type)
    ));
};

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
