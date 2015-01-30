'use strict';

var join = require('path').join;
var pkgs = process.argv.slice(2);
var Worker = require('../sync/worker');
var log = require('../sync/log');
var yaml = require('node-yaml-config');
var CONFIG = yaml.load(join(__dirname, '../config/base.yaml'));
global.CONFIG = CONFIG;

log('start sync: %s', pkgs.join(', '));
var worker = new Worker({
  names: pkgs
});
worker.on('end', function() {
  log('sync end');
});
worker.start();
