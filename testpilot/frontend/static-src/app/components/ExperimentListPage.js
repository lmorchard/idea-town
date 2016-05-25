/* eslint-disable no-unused-vars */
import app from 'ampersand-app';
import React from 'react';

import ExperimentListRow from './ExperimentListRow';

export default class ExperimentListPage extends React.Component {
  render() {
    const {loggedIn, model} = this.props;
    return (
      <div className="blue full-page-wrapper">
        <div className="stars"></div>
        <header data-hook="header-view"></header>
        <div className="responsive-content-wrapper reverse-split-banner ">
          <div className="copter-wrapper fly-down">
            <div className="copter"></div>
          </div>
          <div className="intro-text">
            <h2 data-l10n-id="experimentListPageHeader" className="banner">Now testing!</h2>
            <p data-l10n-id="experimentListPageSubHeader">Pick the features you want to try. <br/> Check back soon for more experiments.</p>
          </div>
        </div>

        <div className="pinstripe responsive-content-wrapper"></div>
        <div className="responsive-content-wrapper">
          <div>
            <div className="card-list experiments">
              {model.map((experiment, idx) => (
                <ExperimentListRow key={idx} loggedIn={loggedIn} experiment={experiment} />
              ))}
            </div>
          </div>
        </div>
        <footer id="main-footer" className="responsive-content-wrapper">
          <div data-hook="footer-view"></div>
        </footer>
      </div>
    );
  }
}
