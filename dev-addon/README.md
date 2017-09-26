Test Pilot development add-on
-----------------------------

**TL;DR, important note:** *This add-on is for Test Pilot developers.* You
probably don't need it. If you do need it, do not install it in your daily use
profile. It makes changes to your Firefox profile that may affect security.

This add-on assists in preparing a Firefox profile for use in development work
on Test Pilot. Because of the elevated privileges and uncommon APIs we use,
there are several preferences that need to be set. 

In addition, some of these things differ between [our deployed
environments][envs]. So, this add-on also offers a quick way to switch between
environments.

## Building
```
npm install
npm run package
# testpilot-dev-addon.xpi should be built
```

## Installing

* Set `extensions.legacy.enabled` to `true` [using `about:config`][aboutconfig],
  which should allow the use of legacy and unsigned Mozilla Extensions.

* Visit `about:debugging`, enable add-on debugging, click "Load Temporary
  Add-on" and select `addon.xpi` built in the previous section

[aboutconfig]: https://support.mozilla.org/en-US/kb/about-config-editor-firefox

## Hacking
```
npm start
#  testpilot-dev-addon.xpi should be built on every file change
```

[envs]: ../docs/development/environment.md
