var debug = require('debug')('spmjs.io:sync:index');
var ms = require('ms');
var async = require('async');
var syncModel = require('./model');
var Worker = require('./worker');
var remote = require('./remote');
debug = console.log;

var syncing = false;

var handleSync = function() {
  if (syncing) return;
  syncing = true;
  debug('start syncing');
  sync(function(err, data) {
    debug('end syncing');
    syncing = false;
  });
};

var syncPackages = function(packages, callback) {
  debug('Total %d packages to sync', packages.length);
  var worker = new Worker({
    names: packages
  });
  worker.on('end', function() {
    callback(null, packages);
  });
  worker.start();
};

var sync = function(callback) {
  var syncTime = Date.now();
  async.waterfall([
    // Get the lastest sync info
    syncModel.last,

    remote.getPackages,
    syncPackages,

    // Write sync info to database
    function(packages, callback) {
      syncModel.add({
        last_sync_time: +syncTime,
        count: packages.length
      }, callback);
    }
  ], callback);
};

if (CONFIG.sync === 'on') {
  handleSync();
  setInterval(handleSync, ms(CONFIG.syncInterval));
}
