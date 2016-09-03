const gulp = require('gulp');
const config = require('../config.js');

const Remarkable = require('remarkable');
const fs = require('fs');
const gutil = require('gulp-util');
const multiDest = require('gulp-multi-dest');
const through = require('through2');

const md = new Remarkable({html: true});

gulp.task('pages-generate', function() {
  const paths = fs.readdirSync(config.CONTENT_SRC_PATH + 'experiments')
    .map(f => `${config.DEST_PATH}experiments/${f.replace('.yaml', '')}`)
    .concat([
      config.DEST_PATH,
      config.DEST_PATH + 'experiments',
      config.DEST_PATH + 'onboarding',
      config.DEST_PATH + 'home',
      config.DEST_PATH + 'share',
      config.DEST_PATH + 'legacy',
      config.DEST_PATH + 'error'
    ]);
  return gulp.src(config.SRC_PATH + 'index.html')
      .pipe(multiDest(paths))
});

const legalTemplates = require('../../legal-copy/legal-templates');

gulp.task('pages-legal', () => {
  return gulp.src('./legal-copy/*.md')
             .pipe(convertToLegalPage())
             .pipe(gulp.dest(config.DEST_PATH));
});

const legalPagePaths = {
  'privacy-notice.md': 'privacy/index.html',
  'terms-of-use.md': 'terms/index.html'
};

function convertToLegalPage() {
  return through.obj(function legalConvert(file, encoding, callback) {
    const filename = file.path.split('/').pop();
    this.push(new gutil.File({
      path: legalPagePaths[filename],
      contents: new Buffer(`${legalTemplates.templateBegin}
                            ${md.render(file.contents.toString())}
                            ${legalTemplates.templateEnd}`)
    }));
    callback();
  });
}

gulp.task('pages-build', ['pages-generate', 'pages-legal']);

gulp.task('pages-watch', () => {
  gulp.watch(config.SRC_PATH + 'index.html', ['pages-generate']);
  gulp.watch(['./legal-copy/*.md', './legal-copy/*.js'], ['pages-legal']);
});
