import React from 'react';
import classnames from 'classnames';
import moment from 'moment';

moment.locale(window.navigator.language);

import LayoutWrapper from './LayoutWrapper';

function prettyDate(date) {
  return moment(date).format('MMMM Do, YYYY');
}

class Update extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hovered: false
    };
  }

  enterHandle() {
    this.setState({ hovered: true });
  }

  leaveHandle() {
    this.setState({ hovered: false });
  }

  render() {
    const { date, updateTitle, summary, experimentTitle, blogLink } = this.props;

    return (
        <a className="update" href={blogLink}
           onMouseEnter={this.enterHandle.bind(this)}
           onMouseLeave={this.leaveHandle.bind(this)}>
          <div className="experiment-icon-containers experiment-icon"></div>
          <div className="update-content">
            <h2>{experimentTitle}</h2> <p className="up-date">{prettyDate(date)}</p>
            <h4>{updateTitle}</h4>
            <p className="summary">{summary}</p>
          </div>
          <div>
            <img className={classnames({ hidden: !this.state.hovered })} alt="chevron" src="" />
          </div>
        </a>);
  }
}

export default class UpdateList extends React.Component {
  renderUpdates() {
    const updates = [{
      date: '12/13/1989',
      updateTitle: 'Queues and History Feature',
      summary: '"Gremlins" are small AM payloads that are meant to run hidden on the target and either subvert the functionality of targeted software, survey the target (including data exfiltration) or provide internal services for other gremlins. The special payload "AlphaGremlin" even.',
      experimentTitle: 'Min Vid',
      experimentImage: '/static/images/experiments/min-vid/icon/thumbnail.png',
      blogLink: 'htts://davejustice.com'
    },
    {
      date: '12/13/2000',
      updateTitle: 'Queues and History Feature',
      summary: '"Gremlins" are small AM payloads that are meant to run hidden on the target and either subvert the functionality of targeted software, survey the target (including data exfiltration) or provide internal services for other gremlins. The special payload "AlphaGremlin" even.',
      experimentTitle: 'Portal',
      experimentImage: '/static/images/experiments/min-vid/icon/thumbnail.png',
      blogLink: 'htts://davejustice.com'
    },
    {
      date: '12/13/2001',
      updateTitle: 'Queues and History Feature',
      summary: '"Gremlins" are small AM payloads that are meant to run hidden on the target and either subvert the functionality of targeted software, survey the target (including data exfiltration) or provide internal services for other gremlins. The special payload "AlphaGremlin" even.',
      experimentTitle: 'Tab Center',
      experimentImage: '/static/images/experiments/min-vid/icon/thumbnail.png',
      blogLink: 'htts://davejustice.com'
    }].sort((a,b) => {
      return new Date(b.date) - new Date(a.date);
    });

    return (
      <div className="update-list">
        <h1 className="emphasis" data-l10n-id="latestUpdatesTitle">Latest Updates</h1>
        <LayoutWrapper flexModifier="column-center">
          {updates.map((update, key) => <Update {...this.props} { ...update }key={key} />)}
        </LayoutWrapper>
      </div>
    );
  }

  render() {
    return this.renderUpdates();
  }
}
