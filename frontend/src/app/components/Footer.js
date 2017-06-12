// @flow

import React from 'react';

import LayoutWrapper from './LayoutWrapper';

type FooterProps = {
  sendToGA: Function
}

export default class Footer extends React.Component {
  props: FooterProps

  render() {
    return (
      <footer id="main-footer">
        <LayoutWrapper flexModifier="row-bottom-breaking">
          <div className="legal-links">
            <a href="https://www.mozilla.org" className="mozilla-logo"></a>
            <a data-l10n-id="footerLinkLegal" href="https://www.mozilla.org/about/legal/" className="boilerplate">Legal</a>
            <a data-l10n-id="footerLinkAbout" href="/about" className="boilerplate">About Test Pilot</a>
            <a data-l10n-id="footerLinkPrivacy" href="/privacy" className="boilerplate">Privacy</a>
            <a data-l10n-id="footerLinkTerms" href="/terms" className="boilerplate">Terms</a>
            <a data-l10n-id="footerLinkCookies" href="https://www.mozilla.org/privacy/websites/#cookies" className="boilerplate">Cookies</a>
          </div>
          <div className="social-links">
            <a onClick={(e) => this.eventToGA(e)} href="https://github.com/mozilla/testpilot"
              target="_blank" className="link-icon github"
              rel="noopener noreferrer" title="GitHub"></a>
            <a onClick={(e) => this.eventToGA(e)} href="https://twitter.com/FxTestPilot"
              target="_blank" rel="noopener noreferrer"
              className="link-icon twitter" title="Twitter"></a>
          </div>
        </LayoutWrapper>
      </footer>
    );
  }

  eventToGA(e: Object) {
    const label = e.target.getAttribute('title');
    this.props.sendToGA('event', {
      eventCategory: 'FooterView Interactions',
      eventAction: 'social link clicked',
      eventLabel: label
    });
  }

}
