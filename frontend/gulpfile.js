const gulp = require('gulp');
const eslint = require('gulp-eslint');

require('es6-promise').polyfill();
require('isomorphic-fetch');

require('./tasks/content');
require('./tasks/scripts');
require('./tasks/styles');
require('./tasks/images');
require('./tasks/assets');
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

gulp.task('build', [
  'content-build',
  'scripts-build',
  'styles-build',
  'images-build',
  'assets-build'
]);

gulp.task('watch', [
  'content-watch',
  'self-watch',
  'scripts-watch',
  'styles-watch',
  'images-watch',
  'assets-watch'
]);

gulp.task('default', ['self-lint', 'build', 'watch', 'server']);
