import app from 'ampersand-app';
import Model from 'ampersand-model';

import querystring from 'querystring';

export default Model.extend({
  urlRoot: '/api/experiments',
  extraProperties: 'allow',
  props: {
    enabled: {type: 'boolean', default: false}
  },
  // This shouldn't be necessary; see comments in collections/experiments.js
  ajaxConfig: { headers: { 'Accept': 'application/json' }},

  // TODO(DJ): this will be removed when we start tracking
  // install state through the User Installation model.
  // https://github.com/mozilla/testpilot/issues/195
  initialize() {
    app.on('addon-install:install-ended', addon => {
      if (addon.id === this.id) {
        this.enabled = true;
      }
    });

    app.on('addon-uninstall:uninstall-ended', addon => {
      if (addon.id === this.id) {
        this.enabled = false;
      }
    });
    console.log('init', this, this.slug, this.title, Object.keys(this));
  },

  buildL10nFieldID(fieldName) {
    return 'experiment_' + this.slug.replace('-', '_') + '_field_' + fieldName;
  },

  buildSurveyURL(ref) {
    const queryParams = querystring.stringify({
      ref: ref,
      experiment: this.title,
      installed: app.me.installed ? Object.keys(app.me.installed) : []
    });
    return `${this.survey_url}?${queryParams}`;
  }
});
