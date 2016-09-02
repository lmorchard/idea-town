import app from 'ampersand-app';

import BaseView from './base-view';

const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = 7 * ONE_DAY;
const MAX_JUST_LAUNCHED_PERIOD = 2 * ONE_WEEK;
const MAX_JUST_UPDATED_PERIOD = 2 * ONE_WEEK;

export default BaseView.extend({
  template: `<div data-hook="show-detail" class="experiment-summary">
                <div class="experiment-actions">
                  <div data-l10n-id="experimentListEnabledTab" data-hook="enabled-tab" class="tab enabled-tab"></div>
                  <div data-l10n-id="experimentListJustLaunchedTab" data-hook="just-launched-tab" class="tab just-launched-tab"></div>
                  <div data-l10n-id="experimentListJustUpdatedTab" data-hook="just-updated-tab" class="tab just-updated-tab"></div>
                </div>
              <div class="experiment-icon-wrapper" data-hook="bg">
                <div class="experiment-icon" data-hook="thumbnail"></div>
              </div>
              <div class="experiment-information">
                <header>
                  <h3 data-hook="title"></h3>
                  <h4 data-hook="subtitle" class="subtitle"></h4>
                  <h4 data-hook="status-msg" class="eol-message"></h4>
                </header>
                <p data-hook="description"></p>
                <span class="participant-count" data-l10n-id="participantCount"</span>
              </div>
             </div>`,

  props: {
    hasAddon: {type: 'boolean', default: 'false'},
    eventCategory: 'string'
  },
  derived: {
    justUpdated: {
      deps: ['model.enabled', 'model.modified', 'model.lastSeen'],
      fn: function() {
        // Enabled trumps launched.
        if (this.model.enabled) { return false; }

        // If modified awhile ago, don't consider it "just" updated.
        const now = Date.now();
        const modified = (new Date(this.model.modified)).getTime();
        if ((now - modified) > MAX_JUST_UPDATED_PERIOD) { return false; }

        // If modified since the last time seen, *do* consider it updated.
        if (modified > this.model.lastSeen) { return true; }

        // All else fails, don't consider it updated.
        return false;
      }
    },
    justLaunched: {
      deps: ['model.enabled', 'model.created', 'model.lastSeen'],
      fn: function() {
        // Enabled & updated trumps launched.
        if (this.model.enabled || this.justUpdated) { return false; }

        // If created awhile ago, don't consider it "just" launched.
        const now = Date.now();
        const created = (new Date(this.model.created)).getTime();
        if ((now - created) > MAX_JUST_LAUNCHED_PERIOD) { return false; }

        // If never seen, *do* consider it "just" launched.
        if (!this.model.lastSeen) { return true; }

        // All else fails, don't consider it launched.
        return false;
      }
    },
    statusMsg: {
      deps: ['model.completed'],
      fn: function() {
        if (this.model.completed) {
          const delta = (new Date(this.model.completed)).getTime() - Date.now();
          if (delta < 0) {
            return '';
          } else if (delta < ONE_DAY) {
            return 'Ending Tomorrow';
          } else if (delta < ONE_WEEK) {
            return 'Ending Soon';
          }
        }
        return '';
      }
    }
  },

  bindings: {
    'model': [{
      hook: 'title',
      type: function shortTitleWithFallback(el, model) {
        el.innerHTML = model.short_title || model.title;
      }
    },
    // TODO: #1138 Replace this highly hackly hook so that the subtitle comes from the model
    {
      hook: 'subtitle',
      type: function removeSubtitle(el, model) {
        (model.title === 'No More 404s') ? el.textContent = 'Powered by the Wayback Machine' : '';
      }
    },
    {
      hook: 'bg',
      type: function setGradientBg(el, model) {
        el.setAttribute('style',
          `background-color: ${model.gradient_start};
          background-image: linear-gradient(135deg, ${model.gradient_start}, ${model.gradient_stop}`);
        return el;
      }
    }],
    'model.description': {
      hook: 'description'
    },
    'model.thumbnail': {
      type: function setBgThumb(el, value) {
        el.setAttribute('style', `background-image: url(${value});`);
        return el;
      },
      hook: 'thumbnail'
    },
    'model.enabled': [{
      type: 'booleanClass',
      hook: 'show-detail',
      name: 'enabled'
    },
    {
      type: 'toggle',
      hook: 'enabled-tab'
    }],
    'justLaunched': [{
      type: 'booleanClass',
      hook: 'show-detail',
      name: 'just-launched'
    },
    {
      type: 'toggle',
      hook: 'just-launched-tab'
    }],
    'justUpdated': [{
      type: 'booleanClass',
      hook: 'show-detail',
      name: 'just-updated'
    },
    {
      type: 'toggle',
      hook: 'just-updated-tab'
    }],
    'statusMsg': {
      type: 'text',
      hook: 'status-msg'
    },
    'hasAddon': {
      type: 'booleanClass',
      hook: 'show-detail',
      name: 'has-addon'
    }
  },

  events: {
    'click [data-hook=show-detail]': 'openDetailPage'
  },

  initialize(opts) {
    this.hasAddon = !!opts.hasAddon;
  },

  openDetailPage(evt) {
    evt.preventDefault();
    app.sendToGA('event', {
      eventCategory: this.eventCategory,
      eventAction: 'Open detail page',
      eventLabel: this.model.title
    });
    app.router.navigate('experiments/' + this.model.slug);
  }
});
