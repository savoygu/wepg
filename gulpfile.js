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
const nodeResolve = require('rollup-plugin-node-resolve');
// const uglify = require('rollup-plugin-uglify').uglify;
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const minimist = require('minimist');

sass.compiler = require('node-sass');

const paths = {
  basePath: 'packages',
  getPkgPath: (packageName, pluginName, pluginType) => './packages/' + packageName + '/' + pluginName + '/' + pluginType
};

const knownOptions = {
  string:' name'
};

const options = minimist(process.argv.slice(2), knownOptions);

const createSassPipe = (name, source, destination, min) => {
  return [
    gulp.src(source),
    sass.sync({
      outputStyle: min ? 'compressed' : 'expanded',
      includePaths: ['node_modules']
    }).on('error', sass.logError),
    rename(path => {
      path.basename = name;
      min && (path.extname = '.min.css');
    }),
    gulp.dest(destination)
  ].filter(Boolean);
};

const generateSassFile = (pkgPath, name) => {
  const source = path.join(pkgPath, 'src/*.scss');
  const destination = path.join(pkgPath, 'dist');

  return pump(
    createSassPipe(name, source, destination),
    () => pump(createSassPipe(name, source, destination, true))
  );
};

const create$Pipe = (name, source, destination, min) => {
  return [
    gulp.src(source),
    min && uglify(),
    rename(path => {
      path.basename = name;
      min && (path.extname = '.min.js');
    }),
    gulp.dest(destination)
  ].filter(Boolean);
};

const generate$File = (pkgPath, name) => {
  const source = path.join(pkgPath, 'src/index.js');
  const destination = path.join(pkgPath, 'dist');

  return pump(
    create$Pipe(name, source, destination),
    () => pump(create$Pipe(name, source, destination, true))
  );
};

const createNativePipe = (source, destination, config) => {
  const min = config.env === 'production';
  let next = gulp.src(source)
    // .pipe(sourcemaps.write())
    .pipe(rollup({
      plugins: [
        babel({
          exclude: 'node_modules/**'
        }),
        nodeResolve({
          module: true,
          jsnext: true,
          main: true,
          browser: true,
          extensions: ['.js']
        })
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
  next.pipe(gulp.dest(destination));
};

const generateNativeFile = (pkgPath) => {
  const pkg = require(pkgPath + '/package.json');
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
  buildTypes.map(buildType => createNativePipe(
    path.join(pkgPath, 'src/index.js'),
    path.join(pkgPath, 'dist'),
    configs[buildType])
  );
};

const buildPlugins = (type, name) => {
  const pkgPath = paths.getPkgPath('wepg', name, type);

  if (name !== undefined) { // 开发原生插件
    return [generateSassFile, generateNativeFile].map(fn => fn.call(this, pkgPath, name));
  }

  fs.readdirSync(paths.basePath + '/wepg')
    .filter(name => name.indexOf('.') === -1)
    .map(pluginName => {
      const pluginPath = paths.getPkgPath('wepg', pluginName, type);
      generateSassFile(pluginPath, pluginName);

      type === 'native' ?
        generateNativeFile(pluginPath) :
        generate$File(pluginPath, pluginName);
    });
};

gulp.task('serve', ['build:native'], () => {
  const pkgPath = paths.getPkgPath('wepg', options.name, 'native');

  browserSync.init({
    server: './packages/wepg/' + options.name + '/native'
  });

  gulp.watch(path.join(pkgPath, 'src/*.scss'), ['sass']);
  gulp.watch(path.join('./packages/!(wepg)/**/src/*.js'), ['build:util']);
  gulp.watch(path.join(pkgPath, 'src/*.js'), ['build:native']);
  gulp.watch([
    path.join(pkgPath, '**/*.html'),
    path.join(pkgPath, '**/*.css'),
    path.join(pkgPath, '**/*.js')
  ]).on('change', reload);
});

gulp.task('sass', () => generateSassFile(paths.getPkgPath('wepg', options.name, 'native'), options.name));
gulp.task('build:$', () => buildPlugins('$'));
gulp.task('build:native', ['build:util'], () => buildPlugins('native', options.name));
gulp.task('build:util', () => {
  fs.readdirSync(paths.basePath)
    .filter(name => (name.indexOf('.') === -1 && name !== 'wepg'))
    .map(packageName => generateNativeFile('./packages/' + packageName));
});

gulp.task('build', ['build:util', 'build:$', 'build:native'], function() {
  console.log('build success'); // eslint-disable-line
});

gulp.task('default', ['serve']);
