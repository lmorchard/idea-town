/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global Components, Services, TelemetryController, TelemetryEnvironment, ClientID, ADDON_INSTALL, ADDON_ENABLE, ADDON_UNINSTALL, ADDON_DISABLE */
import PubSub from 'pubsub-js';

import allTopics from './topics';

import { log } from './utils';
import { registerWebExtensionAPI, sendToWebextension } from './webExtension';

const { utils: Cu, interfaces: Ci } = Components;
Cu.import('resource://gre/modules/Services.jsm');

const prefs = Services.prefs;

const bootstrapTopics = (...args) => allTopics('bootstrap', ...args);
const prefsTopics = (...args) => bootstrapTopics('devPrefs', ...args);
const webExtensionTopics = (...args) =>
  bootstrapTopics('webExtension', ...args);

const devPrefs = {
  'extensions.legacy.enabled': true,
  'testpilot.env': 'local',
  'extensions.install.requireBuiltInCerts': false,
  'xpinstall.signatures.required': false,
  'extensions.webapi.testing': true
};

const PREF_BRANCH = 'testpilot.';
const ENV_PREF = 'testpilot.env';

const prefObserver = {
  register() {
    Services.prefs.addObserver(PREF_BRANCH, this, false);
  },
  unregister() {
    Services.prefs.removeObserver(PREF_BRANCH, this, false);
  },
  observe(aSubject, aTopic, aData) {
    const message = {};
    message[aData] = Services.prefs.getCharPref(aData);
    sendToWebextension(prefsTopics('prefsChange'), message);
  }
};

export function startupDevPrefs(data, reason) {
  log('startupDevPrefs');
  if (reason === ADDON_INSTALL || reason === ADDON_ENABLE) {
    backupAndSetPrefs();
  }
  prefObserver.register();
  PubSub.subscribe(webExtensionTopics('portConnected'), (_, { port }) =>
    sendInitialPrefs(port)
  );
}

export function shutdownDevPrefs(data, reason) {
  log('shutdownDevPrefs');
  prefObserver.unregister();
  switch (reason) {
    case ADDON_UNINSTALL:
    case ADDON_DISABLE:
      restorePrefs();
      break;
    default:
    /* no-op */
  }
}

function sendInitialPrefs(port) {
  const message = {};
  message[ENV_PREF] = Services.prefs.getCharPref(ENV_PREF);
  port.postMessage({ op: prefsTopics('prefsChange'), message });
}

function backupAndSetPrefs() {
  Object.keys(devPrefs).forEach(name => {
    const newValue = devPrefs[name];
    const type = prefs.getPrefType(name);
    const backupName = `testpilot.dev.backup.${name}`;
    const hasBackup = prefs.getPrefType(backupName) !== Ci.nsIPrefBranch.PREF_INVALID;

    // Only backup & set this pref if it hasn't already been handled.
    if (hasBackup) { return; }

    const origValue = getPref(type, name);
    setPref(type, backupName, origValue);
    log('backup up pref', name, backupName, '=', origValue);

    setPref(type, name, newValue);
    log('set pref', name, '=', newValue);
  });
}

function restorePrefs() {
  Object.keys(devPrefs).forEach(name => {
    const newValue = devPrefs[name];
    const type = prefs.getPrefType(name);
    const backupName = `testpilot.dev.backup.${name}`;
    const hasBackup = prefs.getPrefType(backupName) !== Ci.nsIPrefBranch.PREF_INVALID;

    if (!hasBackup) {
      const origValue = getPref(type, backupName);
      setPref(type, name, origValue);
      prefs.clearUserPref(backupName);
      log('restore pref', name, backupName, '=', origValue);
    }
  });
}

function getPref(type, name) {
  return type === Ci.nsIPrefBranch.PREF_BOOL
    ? prefs.getBoolPref(name)
    : prefs.getCharPref(name);
}

function setPref(type, name, value) {
  return type === Ci.nsIPrefBranch.PREF_BOOL
    ? prefs.setBoolPref(name, value)
    : prefs.setCharPref(name, value);
}
