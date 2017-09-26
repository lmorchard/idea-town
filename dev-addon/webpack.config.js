/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable import/no-extraneous-dependencies, global-require */

const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');
const webpack = require('webpack');
const { exec, mkdir, cp } = require('shelljs');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const packageFilename = __dirname + '/package.json';
const package = require(packageFilename);

const NODE_ENV = process.env.NODE_ENV || 'development';
const WATCH_MODE = process.argv.includes('--watch');

class LogChangedFilesPlugin {
  apply (compiler) {
   compiler.plugin("watch-run", (watching, done) => {
    const changedTimes = watching.compiler.watchFileSystem.watcher.mtimes;
    const changedFiles = Object.keys(changedTimes)
      .map(file => `\n  ${file}`)
      .join("");
    if (changedFiles.length) {
      console.log("New build triggered, files changed:", changedFiles);
    }
    done();
   });
  }
}

class AfterBuildPlugin {
  constructor (cb) { this.cb = cb.bind(this); }
  apply (compiler) { compiler.plugin('done', this.cb); }
};

const baseConfig = {
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: { babelrc: false }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': `"${NODE_ENV}"` }),
    new AfterBuildPlugin(postBuild)
  ]
};

module.exports = [
  // HACK: bootstrap.js needs to globally export startup & shutdown
  Object.assign({}, baseConfig, {
    entry: { bootstrap: './src/bootstrap.js' },
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].js',
      library: '{ startup, shutdown }',
      libraryTarget: 'var'
    }
  }),
  // The rest of the JS can get bundled like usual
  Object.assign({}, baseConfig, {
    entry: {
      'webextension/background': './src/webextension/background.js',
      'webextension/popup/index': './src/webextension/popup/index.js'
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: 'LICENSE' },
        { from: './src/install.rdf' },
        { from: './package.json' },
        { from: './src/chrome.manifest' },
        { from: './src/webextension/manifest.json', to: './webextension/' },
        { from: './src/webextension/icons', to: './webextension/icons' },
        {
          from: './src/webextension/popup/index.html',
          to: './webextension/popup/'
        }
      ])
    ].concat(baseConfig.plugins)
  })
];

function postBuild () {
  // HACK: Only perform bundling if the second half of build has been
  // performed, but we still want to rebuild & post the first half on file
  // watching.
  const buildPackagePath = './build/package.json';
  if (!fs.existsSync(buildPackagePath)) { return; }
  let tag = 'dev';
  try {
    tag = childProcess.execSync('git rev-parse --short HEAD')
      .toString('utf-8').trim();
  } catch (e) { /* no-op */ }

  const versionParts = package.version.split('-');
  const origVersion = package.version;
  package.version = versionParts[0] + '-' + tag;

  // Write the modified package.json
  const packageJSON = JSON.stringify(package, null, '  ');
  fs.writeFileSync(buildPackagePath, packageJSON);

  const manifestFilename = __dirname + '/build/webextension/manifest.json';
  const manifest = require(manifestFilename);
  manifest.version = package.version;
  const manifestJSON = JSON.stringify(manifest, null, '  ');
  fs.writeFileSync(manifestFilename, manifestJSON);

  const installFilename = __dirname + '/build/install.rdf';
  const install = fs.readFileSync(installFilename, { encoding: 'utf8' });
  fs.writeFileSync(installFilename, install.replace(
    /<em:version>([\d\.]+)<\/em:version>/,
    `<em:version>${package.version}</em:version>`
  ));

  //if (WATCH_MODE) {
  //  exec('jpm post --addon-dir=build --post-url http://localhost:8888/');
  //} else {
  exec('jpm xpi --addon-dir=build --dest-dir=.');
  //}
};
