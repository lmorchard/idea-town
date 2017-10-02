import classNames from 'classnames';
import React from 'react';
import ReactDOMFactories from 'react-dom-factories';
import Symbol from 'es-symbol';
import { Localized } from 'fluent-react/compat';

import config from '../config';

import Copter from '../components/Copter';
import Footer from '../components/Footer';
import Header from '../components/Header';
import LayoutWrapper from '../components/LayoutWrapper';
import NewsletterFooter from '../components/NewsletterFooter';
import LocalizedHtml from '../components/LocalizedHtml';


const DOMFactories = Object.keys(ReactDOMFactories);


/**
 * Wraps common view elements (header, footer) in a wrapping component. Passes
 * all props down to all children.
 */
export default class View extends React.Component {

  isReactComponent(element) {
    /**
     * Returns a boolean indicating whether or not the passed argument is a
     * React component. This is more complicated than you might expect, because
     * actual components aren't used in tests, instead replaced with component-
     * like proxy objects.
     *
     * The second condition will only pass in tests, and only then because the
     * proxy object looks like this:
     *
     * { '$$typeof': Symbol(react.element), type: 'ComponentName' }
     *
     * or like this, if it is a DOM element:
     *
     * { '$$typeof': Symbol(react.element), type: 'div' }
     */
    return (
      React.Component.isPrototypeOf.call(React.Component, element) || (
        element.$$typeof === Symbol.for('react.element') &&
        DOMFactories.indexOf(element.type) === -1
      )
    );
  }

  renderChildren() {
    /**
     * Returns an array of this components truthy children, passing down this
     * component's props to each of them.
     */
    return React.Children.map(this.props.children, child => {
      if (!child) {
        return null;
      }

      // If the child is a component, merge its props with the View component's
      // props (except for `children`, which is special and should be fully
      // taken from the child).
      if (this.isReactComponent(child)) {
        const combinedProps = Object.assign({}, this.props, child.props);
        combinedProps.children = child.props.children;
        return React.cloneElement(child, combinedProps);
      }

      return child;
    });
  }

  renderNewsletterFooter() {
    if (this.props.showNewsletterFooter) {
      return <NewsletterFooter {...this.props} />;
    }
    return null;
  }

  renderFooter() {
    if (this.props.showFooter) {
      return <Footer {...this.props} />;
    }
    return null;
  }

  renderHeader() {
    if (this.props.showHeader) {
      return <Header {...this.props} />;
    }
    return null;
  }

  makeClassNames(isWarning) {
    return classNames('view', 'full-page-wrapper', {
      centered: this.props.centered,
      'space-between': this.props.spaceBetween || isWarning
    });
  }

  renderUpgradeWarning() {
    const { hasAddon, isFirefox, isMinFirefox } = this.props;

    if (hasAddon === null) return null;

    // TODO: Move these consts into props from App container (#2778)
    const hasAddonManager = typeof navigator.mozAddonManager !== 'undefined';
    const { host, protocol } = window.location;

    if (hasAddonManager) return null;
    if (!isFirefox) return null;

    let title = <Localized id="warningGenericTitle">
      <span>Something is wrong!</span>
    </Localized>;
    let copy = <LocalizedHtml id="warningGenericDetail">
      <p>
        Something has gone wrong with Test Pilot. Please
        <a href="https://github.com/mozilla/testpilot/issues/new">
          file a bug
        </a>
        and mention this error message.
      </p>
    </LocalizedHtml>;
    if (!isMinFirefox) {
      title = <Localized id="warningUpgradeFirefoxTitle">
        <span>Upgrade Firefox to continue!</span>
      </Localized>;
      copy = <LocalizedHtml id="warningUpgradeFirefoxDetail">
        <p>
          Test Pilot reqires the latest version of Firefox.
          <a href="https://www.mozilla.org/firefox/">
            Upgrade Firefox
          </a>
          to get started.
        </p>
      </LocalizedHtml>;
    } else if (protocol !== 'https:') {
      title = <Localized id="warningHttpsRequiredTitle">
        <span>HTTPS required!</span>
      </Localized>;
      copy = <LocalizedHtml id="warningHttpsRequiredDetail">
        <p>
          Test Pilot must be accessed over HTTPS. Please see
          <a href="https://github.com/mozilla/testpilot/blob/master/docs/development/quickstart.md">
            our documentation
          </a>
          for details.
        </p>
      </LocalizedHtml>;
    } else if (!hasAddonManager && config.nonAddonManagerDevHosts.includes(host)) {
      // Allow exceptions for dev hosts known not to have access to mozAddonManager,
      // but do not skip the other checks up to this point.
      return null;
    } else if (config.devHosts.includes(host)) {
      title = <Localized id="warningMissingPrefTitle">
        <span>Developing Test Pilot?</span>
      </Localized>;
      copy = <LocalizedHtml id="warningMissingPrefDetail">
        <p>
          When running Test Pilot locally or in development environments, special configuration is required. Please see
          <a href="https://github.com/mozilla/testpilot/blob/master/docs/development/quickstart.md">
            our documentation
          </a>
          for details.
        </p>
      </LocalizedHtml>;
    } else if (host !== config.prodHost) {
      title = <Localized id="warningBadHostnameTitle">
        <span>Unapproved hostname!</span>
      </Localized>;
      copy = <LocalizedHtml id="warningBadHostnameDetail">
        <p>
          The Test Pilot site may only be accessed from testpilot.firefox.com, testpilot.stage.mozaws.net, testpilot.dev.mozaws.net, or example.com:8000. Please see
          <a href="https://github.com/mozilla/testpilot/blob/master/docs/development/quickstart.md">
            our documentation
          </a>
          for details.
        </p>
      </LocalizedHtml>;
    }
    return <LayoutWrapper flexModifier="column-center">
        <div id="warning" className="modal">
          <header className="modal-header-wrapper neutral-modal">
            <h1 className="modal-header">{ title }</h1>
          </header>
          <div className="modal-content centered">{ copy }</div>
        </div>
        <Copter animation="fade-in-fly-up"/>
      </LayoutWrapper>;
  }

  render() {
    const upgradeWarning = this.renderUpgradeWarning();
    const setWarningLayout = !!upgradeWarning;
    return (
      <section className={this.makeClassNames(setWarningLayout)}>
        {this.renderHeader()}
        {upgradeWarning !== null ? upgradeWarning : this.renderChildren()}
        {upgradeWarning !== null ? null : this.renderNewsletterFooter()}
        {this.renderFooter()}
      </section>
    );
  }

}

View.defaultProps = {
  centered: false,
  showNewsletterFooter: true,
  showFooter: true,
  showHeader: true,
  spaceBetween: false
};

// TODO Implement FlowTypes for View

// View.propTypes = {
//
//   /**
//    * If true, adds the `centered` class to the wrapper. Default: `false`.
//    */
//   centered: PropTypes.bool.isRequired,
//
//   /**
//    * If true, renders a newsletter subscription form above the footer
//    * component. Default: `true`.
//    */
//   showNewsletterFooter: PropTypes.bool.isRequired,
//
//   /**
//    * If true, renders the `<Footer>` component. Default: `true`.
//    */
//   showFooter: PropTypes.bool.isRequired,
//
//   /**
//    * If true, renders the `<Header>` component. Default: `true`.
//    */
//   showHeader: PropTypes.bool.isRequired,
//
//   /**
//    * If true, adds the `space-between` class to the wrapper. Default: `false`.
//    */
//   spaceBetween: PropTypes.bool.isRequired
//
// };
