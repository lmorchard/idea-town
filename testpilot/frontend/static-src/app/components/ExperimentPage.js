/* eslint-disable no-unused-vars */
import app from 'ampersand-app';
import React from 'react';
import classnames from 'classnames';

import ExperimentDisableDialog from './ExperimentDisableDialog';
import ExperimentTourDialog from './ExperimentTourDialog';

const changeHeaderOn = 127;

export default class ExperimentPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      useStickyHeader: false,
      isEnabling: false,
      isDisabling: false,
      progressButtonWidth: null,
      showDisableDialog: false,
      showTourDialog: false
    };
  }

  render() {
    const {isEnabling, isDisabling, highlightMeasurementPanel,
           useStickyHeader, progressButtonWidth,
           showDisableDialog, showTourDialog} = this.state;
    const {experiment} = this.props;
    const details = experiment.details || [];
    const contributors = experiment.contributors || [];

    const l10nArgs = JSON.stringify({
      'title': experiment.title
    });

    return (
      <section id="details" data-hook="experiment-page">

        {showDisableDialog &&
          <ExperimentDisableDialog experiment={experiment}
            onCancel={() => this.setState({showDisableDialog: false})}
            onSubmit={() => this.setState({showDisableDialog: false})} />}

        {showTourDialog &&
          <ExperimentTourDialog experiment={experiment}
            onCancel={() => this.setState({showTourDialog: false})}
            onComplete={() => this.setState({showTourDialog: false})} />}

        <div className="flat-blue">
          <div className="shifted-stars"></div>
          <header data-hook="header-view"></header>
        </div>
        <div className="default-background">
          <div className="spacer"></div>
          <div className={classnames({'details-header-wrapper': true,
                                      'stick': useStickyHeader})}>
            {experiment.enabled ? (
              <div className="details-header content-wrapper">
                <h1 data-hook="title">{experiment.title}</h1>
                <span className="now-active" data-hook="now-active" data-l10n-id="nowActive">Active</span>
                <div className="experiment-controls">
                  <a data-l10n-id="giveFeedback" id="feedback-button"
                     className="button default" target="_blank"
                     onClick={() => this.feedback()}
                     href={experiment.survey_url}>Give Feedback</a>
                  <button onClick={(evt) => this.renderUninstallSurvey(evt)}
                          className={classnames({button: true, secondary: true, 'state-change': isDisabling})}
                          style={{width: progressButtonWidth}}><span className="state-change-inner"></span><span data-l10n-id="disableExperimentTransition" className="transition-text">Disabling...</span><span data-l10n-id="disableExperiment" data-l10n-args={l10nArgs} className="default-text">Disable <span>{experiment.title}</span></span></button>
                </div>
              </div>
            ) : (
              <div className="details-header content-wrapper">
                <h1 data-hook="title">{experiment.title}</h1>
                <div className="experiment-controls">
                  <a onClick={(evt) => this.highlightPrivacy(evt)}
                     className="highlight-privacy" data-l10n-id="highlightPrivacy">Your privacy</a>
                  <button onClick={(evt) => this.install(evt)}
                          className={classnames({button: true, default: true, 'state-change': isEnabling})}
                          style={{width: progressButtonWidth}}><span className="state-change-inner"></span><span data-l10n-id="enableExperimentTransition" className="transition-text">Enabling...</span><span data-l10n-id="enableExperiment" data-l10n-args={l10nArgs} className="default-text">Enable <span>{experiment.title}</span></span></button>
                </div>
              </div>
            )}
          </div>
          <div data-hook="details">
              <div className="details-content content-wrapper">
                <div className="details-overview">
                  <div className="experiment-icon-wrapper" style={{
                    backgroundColor: experiment.gradient_start,
                    backgroundCmage: `linear-gradient(135deg, ${experiment.gradient_start}, ${experiment.gradient_stop})`
                  }}>
                    <img className="experiment-icon" data-hook="thumbnail" src={experiment.thumbnail}></img>
                  </div>
                  <div className="details-sections">
                    <section className="user-count">
                      <span data-l10n-id="userCountContainer">There are <span data-l10n-id="userCount" className="bold" data-hook="install-count">{experiment.installation_count.toLocaleString()}</span>
                      people trying <span>{experiment.title}</span> right now!</span>
                    </section>
                    <section>
                      <table className="stats"><tbody>
                        <tr data-hook="version-container">
                          <td data-l10n-id="version">Version</td>
                          <td>
                            <span data-hook="version">{experiment.version}</span>
                            &nbsp;
                            {experiment.changelog_url && <a data-l10n-id="changelog" data-hook="changelog-url" href={experiment.changelog_url}>changelog</a>}
                          </td>
                        </tr>
                        <tr>
                          <td data-l10n-id="lastUpdate">Last Update</td>
                          <td data-hook="modified-date">{this.formatModifiedDate()}</td>
                        </tr>
                        <tr>
                          <td data-l10n-id="contribute">Contribute</td>
                          <td><a data-hook="contribute-url" href="{experiment.contribute_url}">{experiment.contribute_url}</a></td>
                        </tr>

                        <tr>
                          <td data-l10n-id="bugReports">Bug Reports</td>
                          <td><a data-hook="bug-report-url" href="{experiment.bug_report_url}">{experiment.bug_report_url}</a></td>
                        </tr>
                      </tbody></table>
                    </section>
                    <section className="contributors-section">
                      <h3 data-l10n-id="contributorsHeading">Brought to you by</h3>
                      <ul className="contributors">
                        {contributors.map((contributor, idx) => (
                          <li key={idx}>
                            <img className="avatar" src={contributor.avatar} width="56" height="56" />
                            <div className="contributor">
                              <p className="name">{contributor.display_name}</p>
                              <p className="title">{contributor.title}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section data-hook="measurements-container"
                             className={classnames({measurements: true,
                                                    highlight: highlightMeasurementPanel})}>
                      <h3 data-l10n-id="measurements">Your privacy</h3>
                      {experiment.measurements &&
                        <div className="measurement"
                             dangerouslySetInnerHTML={{__html: experiment.measurements}}></div>}
                      {experiment.privacy_notice_url &&
                        <a className="privacy-policy"
                           data-l10n-id="experimentPrivacyNotice"
                           href={experiment.privacy_notice_url}>You can learn more about the data collection for <span>{experiment.title}</span> here.</a>}
                    </section>
                  </div>
                </div>

                <div className="details-description">
                  {experiment.introduction &&
                    <section className="introduction">
                      <div dangerouslySetInnerHTML={{__html: experiment.introduction}}></div>
                    </section>}
                  <div className="details-list">
                    {details.map((detail, idx) => (
                      <div key={idx}>
                       <div className="details-image">
                         <img width="680" src={detail.image} />
                         <p className="caption"><strong>{detail.headline}</strong> <span>{detail.copy}</span></p>
                       </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer id="main-footer" className="content-wrapper">
            <div data-hook="footer-view"></div>
          </footer>
      </section>
    );
  }

  componentDidMount() {
    this.props.experiment.on('change', () => this.forceUpdate(), this);

    this.didScroll = false;
    window.addEventListener('scroll', function scrollListener() {
      if (!this.didScroll) {
        this.didScroll = true;
        setTimeout(this.onScroll.bind(this), 50);
      }
    }.bind(this));
  }

  onScroll() {
    const sy = window.pageYOffset || document.documentElement.scrollTop;
    this.setState({useStickyHeader: sy > changeHeaderOn});
    this.didScroll = false;
  }

  formatModifiedDate() {
    const {experiment} = this.props;
    const d = new Date(experiment.modified);

    // check for invalid date
    if (isNaN(d)) {
      return '';
    }

    let formatted = '';

    // safari is the new IE :(
    try {
      formatted = d.toLocaleDateString();
    } catch (e) {
      formatted = `${d.getMonth() + 1} / ${d.getDate()} / ${d.getFullYear()}`;
    }
    return formatted;
  }

  feedback() {
    // Survey link is opened via href link in the template
    app.sendToGA('event', {
      eventCategory: 'ExperimentDetailsPage Interactions',
      eventAction: 'button click',
      eventLabel: 'Give Feedback'
    });
  }

  // isInstall is a boolean: true if we are installing, false if uninstalling
  updateAddon(isInstall, model) {
    let eventType = 'install-experiment';

    if (!isInstall) {
      eventType = 'uninstall-experiment';
    }

    app.webChannel.sendMessage(eventType, {
      addon_id: model.addon_id,
      xpi_url: model.xpi_url
    });
  }

  install(evt) {
    const {experiment} = this.props;

    evt.preventDefault();

    this.setState({
      isEnabling: true,
      progressButtonWidth: evt.target.offsetWidth
    });

    // TODO: Should this maybe be an event listener at a global level?
    app.once('webChannel:addon-install:install-ended', () => {
      experiment.enabled = true;
      experiment.set('installation_count', experiment.installation_count + 1);
      experiment.fetch();

      this.setState({
        isEnabling: false,
        progressButtonWidth: null,
        showTourDialog: true
      });
    });
    this.updateAddon(true, experiment);
    app.sendToGA('event', {
      eventCategory: 'ExperimentDetailsPage Interactions',
      eventAction: 'button click',
      eventLabel: 'Enable Experiment'
    });
  }

  uninstall(evt) {
    const {experiment} = this.props;

    evt.preventDefault();
    evt.persist();

    this.setState({
      isDisabling: true,
      progressButtonWidth: evt.target.offsetWidth
    });

    // TODO: Should this maybe be an event listener at a global level?
    app.once('webChannel:addon-uninstall:uninstall-ended', () => {
      this.setState({
        isDisabling: false,
        progressButtonWidth: null
      });
      experiment.enabled = false;
      if (experiment.installation_count > 0) {
        experiment.set('installation_count', experiment.installation_count - 1);
      }
      experiment.fetch();
    });
    this.updateAddon(false, experiment);
  }

  renderUninstallSurvey(evt) {
    const {experiment} = this.props;

    evt.preventDefault();

    app.sendToGA('event', {
      eventCategory: 'ExperimentDetailsPage Interactions',
      eventAction: 'button click',
      eventLabel: 'Disable Experiment'
    });

    this.uninstall(evt);

    this.setState({showDisableDialog: true});
  }

  highlightPrivacy(evt) {
    evt.preventDefault();
    const measurementPanel = document.querySelector('.measurements');
    window.scrollTo(0, measurementPanel.offsetTop + changeHeaderOn);
    this.setState({
      useStickyHeader: true,
      highlightMeasurementPanel: true
    });
    setTimeout(() => {
      this.setState({highlightMeasurementPanel: false});
    }, 5000);
  }
}
