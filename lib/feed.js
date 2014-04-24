var path = require('path');
var nStore = require('nstore');
nStore = nStore.extend(require('nstore/query')());
var yaml = require('node-yaml-config');
var CONFIG = yaml.load('./config/base.yaml');
var feed = nStore.new(path.join(CONFIG.wwwroot, 'db/feed.db'));

exports.add = function(data, callback) {
  feed.save(null, data, function(err) {
    if (err) { throw err; }
    callback && callback();
  });
};

exports.get = function(count, callback) {
  count = count || 10;
  return feed.all(function(err, results) {
    if (err) { throw err; }
    callback && callback(results.reverse().splice(0, count));
  })
};

exports.getAll = function(callback) {
  return feed.all(function(err, results) {
    if (err) { throw err; }
    callback && callback(results.reverse());
  })
};
