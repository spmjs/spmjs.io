'use strict';

var cp = require('child_process');
var ms = require('ms');
var isRunning = false;
var worker;

function cacheIndex() {
  console.log('cacheIndex');

  if (!worker) {
    worker = cp.fork('./lib/cacheIndexWorker');
    worker.on('message', function (m) {
      global.indexResults = m;
      setTimeout(cacheIndex, ms(CONFIG.indexCacheInterval || '1m'));
      isRunning = false;
    });
  }

  if (!isRunning) {
    isRunning = true;
    worker.send('cache');
  }
}

module.exports = cacheIndex;
