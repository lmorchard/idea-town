const self = require("sdk/self");

const {Cc, Ci, Cu} = require('chrome');
Cu.import('resource://gre/modules/Services.jsm');

const {ToggleButton} = require('sdk/ui/button/toggle');
const {Panel} = require('sdk/panel');

const EVENT_SEND_METRIC = 'testpilot::send-metric';
function sendMetricsPing(key, data) {
  Services.obs.notifyObservers(null, EVENT_SEND_METRIC, JSON.stringify({
    addonName: self.name,
    key: key,
    value: data
  }));
}

const panel = Panel({ // eslint-disable-line new-cap
  contentURL: './panel.html',
  contentScriptFile: './panel.js',
  onHide: () => {
    button.state('window', {checked: false});
  }
});

const button = ToggleButton({ // eslint-disable-line new-cap
  id: "experiment-1-link",
  label: "Experiment 1",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onChange: (state) => {

    sendMetricsPing('panel', { state: state });

    if (!state.checked) { return; }

    panel.show({
      width: 200, height: 200,
      // width: PANEL_WIDTH,
      // height: (experimentCount * EXPERIMENT_HEIGHT) + FOOTER_HEIGHT,
      position: button
    });

  }
});

require('sdk/system/unload').when(function(reason) {
  panel.destroy();
  button.destroy();
});
