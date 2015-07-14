'use strict';

require('gnode');
var co = require('co');
var join = require('path').join;

// load global config
var yaml = require('node-yaml-config');
var CONFIG = yaml.load(join(__dirname, '../config/base.yaml'));
global.CONFIG = CONFIG;

var Project = require('../models/project');
var sync = require('./_index');
var _sync = require('thunkify')(sync);

if (!CONFIG.npmSyncUser || !CONFIG.npmSyncUserId) {
  console.error('please config npmSyncUser and npmSyncUserId in config/base.yml first');
  process.exit(1);
}

co(function *() {
  yield syncAll();
}).then(function() {
  callback();
}, function(err) {
  log.error('error', err);
  console.error(err.stack);
  callback(err);
});

function *syncAll() {
  var names = getAllPkgs();
  for (var i = 0; i < names.length; i++) {
    yield _sync(names[i], 5, {
      name: CONFIG.npmSyncUser,
      id: CONFIG.npmSyncUserId
    });
  }
}

function getAllPkgs() {
  var ret = [];
  var names = Project.getAll();
  for (var i=0; i<names.length; i++) {
    var name = names[i];
    var proj = new Project({name:name});
    if (proj.sync_from_npm) {
      ret.push(name);
    }
  }
  return ret;
}
