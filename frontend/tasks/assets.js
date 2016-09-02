const gulp = require('gulp');
const config = require('../config.js');

const gutil = require('gulp-util');
const Remarkable = require('remarkable');
const through = require('through2');

const md = new Remarkable({html: true});

gulp.task('assets-locales', function localesTask() {
  return gulp.src('../locales/**/*')
    .pipe(gulp.dest(config.DEST_PATH + 'locales'));
});

gulp.task('assets-addon', function localesTask() {
  return gulp.src(config.SRC_PATH + 'addon/**/*')
    .pipe(gulp.dest(config.DEST_PATH + 'addon'));
});

const legalTemplates = require('../../legal-copy/legal-templates');
const legalPagePaths = {
  'privacy-notice.md': 'privacy/index.html',
  'terms-of-use.md': 'terms/index.html'
};

function convertToLegalPage() {
  return through.obj(function legalConvert(file, encoding, callback) {
    file.contents = new Buffer(`${legalTemplates.templateBegin}
                                ${md.render(file.contents.toString())}
                                ${legalTemplates.templateEnd}`);
    const filename = file.path.split('/').pop();
    console.log(filename);
    file.path = legalPagePaths[filename];
    this.push(file);
    callback();
  });
}

gulp.task('assets-legal', function legalTask() {
  return gulp.src('../legal-copy/*.md')
             .pipe(convertToLegalPage())
             .pipe(gulp.dest(config.DEST_PATH));
});

gulp.task('assets-build', [
  'assets-locales',
  'assets-addon',
  'assets-legal'
]);

gulp.task('assets-watch', () => {
  gulp.watch(config.SRC_PATH + 'addon/**/*', ['assets-addon']);
  gulp.watch(['../legal-copy/*.md', '../legal-copy/*.js'], ['assets-legal']);
  gulp.watch('../locales/**/*', ['assets-locales']);
});
