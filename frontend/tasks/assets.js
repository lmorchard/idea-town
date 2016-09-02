const gulp = require('gulp');
const config = require('../config.js');

gulp.task('assets-locales', function localesTask() {
  return gulp.src('../locales/**/*')
    .pipe(gulp.dest(config.DEST_PATH + 'static/locales'));
});

gulp.task('assets-addon', function localesTask() {
  return gulp.src(config.SRC_PATH + 'addon/**/*')
    .pipe(gulp.dest(config.DEST_PATH + 'static/addon'));
});

gulp.task('assets-build', [
  'assets-locales',
  'assets-addon'
]);

gulp.task('assets-watch', () => {
  gulp.watch(config.SRC_PATH + 'addon/**/*', ['assets-addon']);
  gulp.watch('../locales/**/*', ['assets-locales']);
});
