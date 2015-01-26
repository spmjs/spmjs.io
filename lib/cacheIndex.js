var async = require('async');
var account = require('../models/account');
var history= require('../lib/history');
var download = require('../lib/download');
var dependent = require('../lib/dependent');
var anonymous = CONFIG.authorize.type === 'anonymous';
var ms = require('ms');

var isRunning = false;

function cacheIndex() {
  if (isRunning) {
    return;
  }

  isRunning = true;
  console.log('cacheIndex');
  async.parallel([
    function(callback) {
      download.stat(function(downloadResult) {
        callback(null, downloadResult);
      });
    },
    function(callback) {
      history.stat(function(recentlyUpdates, publishCount) {
        callback(null, {
          recentlyUpdates: recentlyUpdates,
          publishCount: publishCount
        });
      });
    },
    function(callback) {
      if (anonymous) {
        callback();
      } else {
        account.getAll(function(users) {
          callback(null, users);
        });
      }
    },
    function(callback) {
      callback(null, dependent.getSortedDependents());
    }
  ], function(err, results) {
    global.indexResults = results;
    setTimeout(cacheIndex, ms(CONFIG.indexCacheInterval || '1m'));
    isRunning = false;
  });
};

module.exports = cacheIndex;
