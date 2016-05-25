/* eslint-disable no-unused-vars */
import app from 'ampersand-app';
import ReactPageView from './react-page-view';
import React from 'react';

import ExperimentPage from '../components/ExperimentPage';

export default ReactPageView.extend({
  headerScroll: true,

  initialize(opts) {
    this.model = app.experiments.get(opts.slug, 'slug');
    this.pageTitle = 'Test Pilot - ' + this.model.title;
    this.pageTitleL10nID = 'pageTitleExperiment';
  },

  render() {
    app.sendToGA('pageview', {
      'dimension4': this.model.enabled,
      'dimension5': this.model.title,
      'dimension6': this.model.installation_count
    });
    ReactPageView.prototype.render.apply(this, arguments);
  },

  renderReact() {
    return <ExperimentPage experiment={this.model} />;
  }
});
