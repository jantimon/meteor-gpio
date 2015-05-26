'use strict';

Package.describe({
  name: 'jantimon:gpio',
  summary: 'Getting and setting GPIO values for Raspberry Pi / Odroid / BeagleBone gpio',
  version: '0.1.0',
  git: 'https://github.com/jantimon/meteor-gpio'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.1');
  api.use(['meteor', 'meteorhacks:async']);
  api.addFiles('client/index.js', ['client']);
  api.addFiles('server/index.js', ['server']);
  api.export('gpio');
});

Npm.depends({
  'onoff': '1.0.2',
  'eventemitter3': '1.1.0'
});

