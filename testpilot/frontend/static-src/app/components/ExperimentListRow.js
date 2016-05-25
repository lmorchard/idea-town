import app from 'ampersand-app';
import React from 'react';
import classnames from 'classnames';

export default class ExperimentListRow extends React.Component {
  render() {
    const {experiment, loggedIn} = this.props;
    return (
      <div onClick={(evt) => this.openDetailPage(evt)}
           className={classname(
             'experiment-summary',
             {'logged-in': loggedIn, 'active': experiment.enabled}
           )}>
        <div className="experiment-icon-wrapper" style={{
          backgroundColor: experiment.gradient_start,
          backgroundImage: `linear-gradient(135deg, ${experiment.gradient_start}, ${experiment.gradient_stop}`
        }}>
          <div className="experiment-icon" style={{backgroundImage: `url(${experiment.thumbnail})`}}></div>
        </div>
        <div className="experiment-information">
          <header>
            <h3>{experiment.title}</h3>
          </header>
          <p>{experiment.description}</p>
        </div>
         <div className="experiment-actions">
            <button data-l10n-id="experimentListInactiveHover"
                    className="button default show-when-inactive">Get Started</button>
            <button data-l10n-id="experimentListActiveHover"
                    className="button secondary show-when-active">Manage</button>
         </div>
      </div>
    );
  }

  openDetailPage(evt) {
    const {experiment} = this.props;
    evt.preventDefault();
    if (experiment.enabled) {
      app.sendToGA('event', {
        eventCategory: 'ExperimentsPage Interactions',
        eventAction: 'Manage experiment button',
        eventLabel: experiment.title
      });
    } else {
      app.sendToGA('event', {
        eventCategory: 'ExperimentsPage Interactions',
        eventAction: 'Get Started experiment button',
        eventLabel: experiment.title
      });
    }
    app.router.navigate('experiments/' + experiment.slug);
  }
}
