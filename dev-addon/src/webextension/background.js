/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global browser */

import PubSub from 'pubsub-js';

import { log, debug } from './lib/utils';
import { setupBootstrapPort, sendBootstrapMessage } from './lib/bootstrap';

PubSub.immediateExceptions = true;

function setup() {
  log('setup');
  setupDebug()
    .then(setupBootstrapPort)
    .then(() => sendBootstrapMessage('ready'))
    .catch(err => log('init error', err));
}

async function setupDebug() {
  if (!debug) return;
  ['bootstrap', 'webExtension'].forEach(root =>
    PubSub.subscribe(root, (message, data) => log('pubsub', message, data))
  );
}

setup();
