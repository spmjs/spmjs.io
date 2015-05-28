var async = require('async');
var account = require('../models/account');
var history= require('../lib/history');
var download = require('../lib/download');
var dependent = require('../lib/dependent');
var anonymous = CONFIG.authorize.type === 'anonymous';
var ms = require('ms');
var cp = require('child_process');

var isRunning = false;

function cacheIndex() {
  console.log('cacheIndex');

  var worker = cp.fork('./lib/cacheIndexWorker');
  worker.on('message', function(m) {
    console.log(m);
    global.indexResults = m;
    setTimeout(cacheIndex, ms(CONFIG.indexCacheInterval || '1m'));
    isRunning = false;
  });

  if (!isRunning) {
    isRunning = true;
    worker.send('cache');
  }
}

module.exports = cacheIndex;
