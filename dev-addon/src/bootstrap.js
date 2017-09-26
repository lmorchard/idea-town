/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global APP_STARTUP */

import PubSub from 'pubsub-js';

import { debug, log, setAddonMetadata } from './lib/utils';
import { startupDone, startupPromise, startupObserver } from './lib/appStartup';
import { startupDevPrefs, shutdownDevPrefs } from './lib/devPrefs';
import { startupWebExtension, shutdownWebExtension } from './lib/webExtension';

PubSub.immediateExceptions = true;

export function startup(data, reason) {
  log('startup');
  setAddonMetadata(data);

  if (reason === APP_STARTUP) {
    startupObserver.register();
  } else {
    startupDone();
  }

  return startupPromise
    .then(setupDebug)
    .then(() => startupDevPrefs(data, reason))
    .then(() => startupWebExtension(data, reason))
    .then(() => log('startup complete!'))
    .catch(err => log('startup error', err));
}

export function shutdown(data, reason) {
  try {
    log('shutdown');
    PubSub.clearAllSubscriptions();
    shutdownWebExtension(data, reason);
    shutdownDevPrefs(data, reason);
  } catch (err) {
    log('shutdown error', err);
  }
}

async function setupDebug() {
  if (!debug) return;
  ['bootstrap', 'webExtension'].forEach(root =>
    PubSub.subscribe(root, (message, data) => log('pubsub', message, data))
  );
}
