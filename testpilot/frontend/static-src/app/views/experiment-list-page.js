/* eslint-disable no-unused-vars */
import app from 'ampersand-app';
import ReactPageView from './react-page-view';
import React from 'react';

import ExperimentListPage from '../components/ExperimentListPage';

export default ReactPageView.extend({
  pageTitle: 'Firefox Test Pilot',
  pageTitleL10nID: 'pageTitleExperimentListPage',
  render() {
    this.loggedIn = !!app.me.user.id;
    app.sendToGA('pageview', {'dimension1': this.loggedIn});
    ReactPageView.prototype.render.apply(this, arguments);
  },
  renderReact() {
    return <ExperimentListPage model={app.experiments}
                               loggedIn={this.loggedIn} />;
  }
});
