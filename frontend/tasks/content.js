const gulp = require('gulp');
const config = require('../config.js');

const fs = require('fs');
const isArray = require('util').isArray;
const mkdirp = require('mkdirp');
const through = require('through2');
const gutil = require('gulp-util');
const YAML = require('yamljs');

const util = require('./util');

const NEWS_UPDATES_YAML = config.CONTENT_SRC_PATH + 'news_updates.yaml'

gulp.task('content-build', [ 'content-experiments-data' ]);

gulp.task('content-watch', () =>
  gulp.watch(config.CONTENT_SRC_PATH + '/**/*.yaml', [ 'content-experiments-data' ]));

gulp.task('content-experiments-data', () =>
  gulp.src(config.CONTENT_SRC_PATH + 'experiments/*.yaml')
    .pipe(buildExperimentsData())
    .pipe(gulp.dest(config.DEST_PATH)));

function buildExperimentsData() {
  const index = {results: []};
  const strings = [];
  const counts = {};
  const cssStrings = [];

  // Prime the set of news updates from general items
  const newsUpdatesData = fs.readFileSync(NEWS_UPDATES_YAML).toString('utf-8');
  let newsUpdates = YAML.parse(newsUpdatesData)

  function findLocalizableStrings(obj, pieces = [], experiment = null) {
    if (!experiment) {
      experiment = obj;
    }
    if (isArray(obj)) {
      obj.forEach((item, index) => {
        findLocalizableStrings(item, [].concat(pieces, index), experiment);
      });
    } else if (typeof obj === 'object') {
      for (var key in obj) {
        findLocalizableStrings(obj[key], [].concat(pieces, key), experiment);
      }
    } else if (obj && typeof obj === 'string' && util.isLocalizableField(pieces)) {
      strings.push({
        key: util.experimentL10nId(experiment, pieces, pieces.join('.')),
        value: obj
      });
    }
  }

  function generateFTL() {
    return strings.reduce((a, b) => {
      const value = b.value.replace(/\r?\n|\r/g, '').replace(/\s+/g, ' ');
      return `${a}\n${b.key} = ${value}`;
    }, '');
  }

  function collectEntry(file, enc, cb) {
    const yamlData = file.contents.toString();
    const experiment = YAML.parse(yamlData);

    if (experiment.dev && !config.ENABLE_DEV_CONTENT) {
      // Exclude dev content if it's not enabled in config
      return cb();
    }

    // Extract news updates from experiment, annotate each update with slug.
    if (experiment.news_updates) {
      const { news_updates, slug } = experiment;
      newsUpdates = newsUpdates.concat(news_updates.map(update => ({
        ...update, experimentSlug: slug
      })));
      delete experiment.news_updates;
    }

    cssStrings.push(`
.experiment-icon-wrapper-${experiment.slug} {
  background-color: ${experiment.gradient_start};
  background-image: linear-gradient(135deg, ${experiment.gradient_start}, ${experiment.gradient_stop});
}

.experiment-icon-${experiment.slug} {
  background-image: url(${experiment.thumbnail});
}
`);

    // Auto-generate some derivative API values expected by the frontend.
    Object.assign(experiment, {
      url: `/api/experiments/${experiment.id}.json`,
      html_url: `/experiments/${experiment.slug}`,
      survey_url: `https://qsurvey.mozilla.com/s3/${experiment.slug}`
    });

    counts[experiment.addon_id] = experiment.installation_count;
    delete experiment.installation_count;

    this.push(new gutil.File({
      path: `experiments/${experiment.id}.json`,
      contents: new Buffer(JSON.stringify(experiment, null, 2))
    }));

    index.results.push(experiment);
    if (!experiment.dev) {  // Don't collect strings for dev-only experiments
      findLocalizableStrings(experiment);
    }

    cb();
  }

  function extractNewsUpdateStrings() {
    // Extract FTL strings for news updates
    const newsUpdateL10nFields = ['title', 'content'];
    newsUpdates.forEach(update => {
      newsUpdateL10nFields.forEach(fieldName => {
        strings.push({
          key: util.newsUpdateL10nId(update, fieldName),
          value: update[fieldName]
        });
      });
    });
  }

  function endStream(cb) {
    // One last sweep through updates to exclude dev content where not wanted
    newsUpdates = newsUpdates
      .filter(update => config.ENABLE_DEV_CONTENT || !update.dev);
    extractNewsUpdateStrings();

    this.push(new gutil.File({
      path: '../../locales/en-US/experiments.ftl',
      contents: new Buffer(generateFTL())
    }));
    // These files are being consumed by 3rd parties (at a minimum, the Mozilla
    // Measurements Team).  Before changing them, please consult with the
    // appropriate folks!
    this.push(new gutil.File({
      path: 'api/experiments.json',
      contents: new Buffer(JSON.stringify(index, null, 2))
    }));
    this.push(new gutil.File({
      path: 'api/experiments/usage_counts.json',
      contents: new Buffer(JSON.stringify(counts, null, 2))
    }));
    this.push(new gutil.File({
      path: 'static/styles/experiments.css',
      contents: new Buffer(cssStrings.join('\n'))
    }));
    this.push(new gutil.File({
      path: 'api/news_updates.json',
      contents: new Buffer(JSON.stringify(newsUpdates, null, 2))
    }));
    cb();
  }

  return through.obj(collectEntry, endStream);
}
