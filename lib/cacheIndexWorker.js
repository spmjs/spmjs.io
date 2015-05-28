'use strict';

// load global config
var yaml = require('node-yaml-config');
var CONFIG = yaml.load('./config/base.yaml');
global.CONFIG = CONFIG;

var async = require('async');
var account = require('../models/account');
var history= require('../lib/history');
var download = require('../lib/download');
var dependent = require('../lib/dependent');
var anonymous = CONFIG.authorize.type === 'anonymous';

process.on('message', function(m) {

  function doCache(done) {
    console.log('cacheIndexWorker: do cache for index');
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
    ], done);
  }

  doCache(function(err, results) {
    process.send(results);
    process.exit(0);
  });
});


