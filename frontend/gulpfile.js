const gulp = require('gulp');
const config = require('./config.js');

const del = require('del');
const eslint = require('gulp-eslint');
const runSequence = require('run-sequence');

require('es6-promise').polyfill();
require('isomorphic-fetch');

require('./tasks/content');
require('./tasks/scripts');
require('./tasks/styles');
require('./tasks/images');
require('./tasks/assets');
require('./tasks/pages');
require('./tasks/dist');
require('./tasks/server');

// Exit if the gulpfile changes so we can self-reload with a wrapper script.
gulp.task('self-watch', () => gulp.watch([
  './gulpfile.js',
  './config.js',
  '../debug-config.json',
  'tasks/*.js'
], () => process.exit()));

gulp.task('self-lint', () => gulp.src('gulpfile.js')
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failOnError()));

gulp.task('clean', () => del([
  config.DEST_PATH
]));

gulp.task('build', [
  'content-build',
  'scripts-build',
  'styles-build',
  'images-build',
  'assets-build',
  'pages-build'
]);

gulp.task('watch', [
  'content-watch',
  'self-watch',
  'scripts-watch',
  'styles-watch',
  'images-watch',
  'assets-watch',
  'pages-watch'
]);

gulp.task('default', () => runSequence(
  'self-lint',
  'clean',
  'build',
  'watch',
  'server'
));
