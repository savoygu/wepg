import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
// import sourcemaps from 'gulp-sourcemaps';
import rollup from 'gulp-better-rollup';
import babel from 'rollup-plugin-babel';
// import { uglify } from 'rollup-plugin-uglify'
import uglify from 'gulp-uglify';
import browserSync from 'browser-sync';
import minimist from 'minimist';

const reload = browserSync.reload;

const paths = {
  baseDIR: 'packages',
  genTypedDIR: (name, type) => 'packages/' + name + '/' + type
};

const knownOptions = {
  string:' name'
};

var options = minimist(process.argv.slice(2), knownOptions);

const createPipe = (type, pluginDIR, config) => {
  let next = gulp.src(path.join(pluginDIR, 'src/index.js'));
  if (type === 'native') {
    var min = config.env === 'production';
    // next = next.pipe(sourcemaps.init())
    next = next.pipe(rollup({
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
  }
  next.pipe(gulp.dest(path.join(pluginDIR, 'dist')));
};

const buildPlugins = (type, name) => {
  var pluginNames;
  if (!name) {
    pluginNames = fs.readdirSync(paths.baseDIR)
      .filter(name => name.indexOf('.') < 0);
  } else {
    pluginNames = [name];
  }

  pluginNames.forEach(name => {
    const pluginDIR = paths.genTypedDIR(name, type);
    const pkg = require('./packages/' + name + '/native/package.json');
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
    buildTypes.map(buildType => createPipe(type, pluginDIR, configs[buildType]));
  });
};

gulp.task('serve', ['build:native'], function() {
  browserSync.init({
    server: './packages/' + options.name + '/native'
  });

  gulp.watch('./packages/' + options.name + '/native/src/*.js', ['build:native']);
  gulp.watch(['./packages/' + options.name + '/native/**/*.*']).on('change', reload);
});

gulp.task('build:$', () => buildPlugins('$'));
gulp.task('build:native', () => buildPlugins('native', options.name));

gulp.task('build', ['build:$', 'build:native'], function() {
  console.log('build success'); // eslint-disable-line
});

gulp.task('default', ['serve']);
