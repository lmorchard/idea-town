import React from 'react';
import createClass from 'create-react-class';
import { assert, expect } from 'chai';
import sinon from 'sinon';
import { shallow, mount, render } from 'enzyme';

import { defaultState } from '../../../src/app/reducers/newsletter-form';
import View from '../../../src/app/components/View';
import appConfig from '../../../src/app/config';

const FooComponent = createClass({
  render: function(){
    return <p>{this.props.foo}</p>;
  }
});

const mockRequiredProps = {
  hasAddon: null,
  isFirefox: true,
  uninstallAddon: sinon.spy(),
  sendToGA: sinon.spy(),
  openWindow: sinon.spy(),
  getWindowLocation: sinon.spy(() => 'https://example.com'),
  newsletterForm: defaultState()
};


describe('app/components/View', () => {

  // HACK: store & restore old mock window global between tests
  // TODO: replace with props (#2778)
  let oldWindow;
  beforeEach(() => oldWindow = global.window);
  afterEach(() => global.window = oldWindow);

  it('should pass its props to child components', () => {
    const wrapper = mount(
      <View foo="bar" {...mockRequiredProps}>
        <FooComponent />
      </View>
    );
    expect(wrapper.find('p').first().props('foo').children).to.equal('bar');
  });

  it('should not pass its props to child DOM elements', () => {
    const wrapper = mount(
      <View foo="bar" {...mockRequiredProps}>
        <p></p>
      </View>
    );
    expect(wrapper.find('p').first().props()).to.not.have.key('foo');
  });

  it('should gracefully skip falsy elements', () => {
    assert.doesNotThrow(() => {
      mount(
        <View {...mockRequiredProps}>
          {false && <FooComponent />}
          <FooComponent />
        </View>
      )
    }, Error);
  });

  it('should only use the child\'s children', () => {
    const wrapper = mount(
      <View foo="baz" {...mockRequiredProps}>
        <FooComponent foo="bar">
          <p>Hello, frend.</p>
        </FooComponent>
      </View>
    );
    const inner = wrapper.find(FooComponent).first();
    expect(inner.props().children.type).to.equal('p');
  });

  it('should rerender its children', () => {
    const wrapper = mount(<View {...mockRequiredProps}><FooComponent /></View>);
    expect(wrapper.find('FooComponent')).to.have.length(1);
  });

  it('should render the footer by default', () => {
    const wrapper = shallow(<View {...mockRequiredProps}><FooComponent /></View>);
    expect(wrapper.find('Footer')).to.have.length(1);
  });

  it('should not render the footer when requested', () => {
    const wrapper = shallow(<View showFooter={false} {...mockRequiredProps}><FooComponent /></View>);
    expect(wrapper.find('Footer')).to.have.length(0);
  });

  it('should render the header by default', () => {
    const wrapper = shallow(<View {...mockRequiredProps}><FooComponent /></View>);
    expect(wrapper.find('Header')).to.have.length(1);
  });

  it('should not render the header when requested', () => {
    const wrapper = shallow(<View showHeader={false} {...mockRequiredProps}><FooComponent /></View>);
    expect(wrapper.find('Header')).to.have.length(0);
  });

  it('should render the newsletter footer by default', () => {
    const wrapper = shallow(<View {...mockRequiredProps}><FooComponent /></View>);
    expect(wrapper.find('NewsletterFooter')).to.have.length(1);
  });

  it('should not render the newsletter footer when requested', () => {
    const wrapper = shallow(<View showNewsletterFooter={false} {...mockRequiredProps}><FooComponent /></View>);
    expect(wrapper.find('NewsletterFooter')).to.have.length(0);
  });

  it('should show a warning if Firefox is too old', () => {
    const wrapper = shallow(<View {...mockRequiredProps} hasAddon={true} isMinFirefox={false}><FooComponent /></View>);
    expect(wrapper.find('#warning')).to.have.length(1);
  });

  it('should show a warning if protocol is not https', () => {
    window.location.protocol = 'http:';
    const wrapper = shallow(<View {...mockRequiredProps} hasAddon={true}><FooComponent /></View>);
    window.location.protocol = 'https:';
    expect(wrapper.find('#warning')).to.have.length(1);
  });

  it('should show a warning if extensions.webapi.testing is not set', () => {
    const wrapper = shallow(<View {...mockRequiredProps} hasAddon={false}><FooComponent /></View>);
    expect(wrapper.find('#warning')).to.have.length(1);
  });

  it('should not show a warning if mozAddonManager is missing but the host is an exception', () => {
    // HACK: construct minimal window global. JSDOM window.location is partly read-only :/
    // TODO: replace with props (#2778)
    global.window = {
      location: {
        protocol: 'https:',
        host: appConfig.nonAddonManagerDevHosts[0]
      }
    };
    const wrapper = shallow(
      <View {...mockRequiredProps} isMinFirefox={true} hasAddon={true}>
        <FooComponent />
      </View>
    );
    expect(wrapper.find('#warning')).to.have.length(0);
  });

  it('should show a warning if hostname is unapproved', () => {
    window.location.host = 'asdf';
    const wrapper = shallow(<View {...mockRequiredProps} hasAddon={true}><FooComponent /></View>);
    window.location.host = 'testpilot.firefox.com';
    expect(wrapper.find('#warning')).to.have.length(1);
  });
});
