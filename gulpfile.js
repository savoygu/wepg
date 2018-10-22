const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const pump = require('pump');
// const sourcemaps = require('gulp-sourcemaps');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
// const uglify = require('rollup-plugin-uglify').uglify;
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const minimist = require('minimist');

sass.compiler = require('node-sass');

const paths = {
  basePath: 'packages',
  getFullPath: (pluginName, pluginType, filePath) => path.join('./packages', pluginName, pluginType, filePath)
};

const knownOptions = {
  string:' name'
};

const options = minimist(process.argv.slice(2), knownOptions);

const createSassPipe = (name, type, min) => {
  return [
    gulp.src(paths.getFullPath(name, type, 'src/*.scss')),
    sass.sync({
      outputStyle: min ? 'compressed' : 'expanded',
      includePaths: ['node_modules']
    }).on('error', sass.logError),
    rename(path => {
      path.basename = name;
      min && (path.extname = '.min.css');
    }),
    gulp.dest(paths.getFullPath(name, type, 'dist'))
  ].filter(Boolean);
};

const generateSassFile = (name, type) => pump(
  createSassPipe(name, type),
  () => pump(createSassPipe(name, type, true))
);

const create$Pipe = (name, type, min) => {
  return [
    gulp.src(paths.getFullPath(name, type, 'src/index.js')),
    min && uglify(),
    rename(path => {
      path.basename = name;
      min && (path.extname = '.min.js');
    }),
    gulp.dest(paths.getFullPath(name, type, 'dist'))
  ].filter(Boolean);
};

const generate$File = (name, type) => pump(
  create$Pipe(name, type),
  () => pump(create$Pipe(name, type, true))
);

const createNativePipe = (name, type, config) => {
  const min = config.env === 'production';
  let next = gulp.src(paths.getFullPath(name, type, 'src/index.js'))
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
  next.pipe(gulp.dest(paths.getFullPath(name, type, 'dist')));
};

const generateNativeFile = (name, type) => {
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
  buildTypes.map(buildType => createNativePipe(name, type, configs[buildType]));
};

const buildPlugins = (type, name) => {
  if (name !== undefined) { // 开发原生插件
    return [generateSassFile, generateNativeFile].map(fn => fn.call(this, name, type));
  }

  fs.readdirSync(paths.basePath)
    .filter(name => name.indexOf('.') === -1)
    .map(pluginName => {
      generateSassFile(pluginName, type);

      type === 'native' ?
        generateNativeFile(pluginName, type) :
        generate$File(pluginName, type);
    });
};

gulp.task('serve', ['build:native'], () => {
  browserSync.init({
    server: './packages/' + options.name + '/native'
  });

  gulp.watch(paths.getFullPath(options.name, 'native', 'src/*.scss'), ['sass']);
  gulp.watch(paths.getFullPath(options.name, 'native', 'src/*.js'), ['build:native']);
  gulp.watch([
    paths.getFullPath(options.name, 'native', '**/*.html'),
    paths.getFullPath(options.name, 'native', '**/*.css'),
    paths.getFullPath(options.name, 'native', '**/*.js')
  ]).on('change', reload);
});

gulp.task('sass', () => generateSassFile(options.name, 'native'));
gulp.task('build:$', () => buildPlugins('$'));
gulp.task('build:native', () => buildPlugins('native', options.name));

gulp.task('build', ['build:$', 'build:native'], function() {
  console.log('build success'); // eslint-disable-line
});

gulp.task('default', ['serve']);
