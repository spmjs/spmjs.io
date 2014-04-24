var path = require('path');
var nStore = require('nstore');
nStore = nStore.extend(require('nstore/query')());
var feed = nStore.new(path.join(CONFIG.wwwroot, 'db', 'feed.db'));

exports.add = function(data, callback) {
  feed.save(null, data, function(err) {
    if (err) { throw err; }
    callback && callback();
  });
};

exports.get = function(callback, count) {
  count = count || 10;
  return feed.all(function(err, results) {
    if (err) { throw err; }
    var res = [];
    for (var i in results) {
      res.push(results[i]);
    }
    res = res.reverse();
    callback && callback(res.splice(0, count));
  })
};

exports.getAll = function(callback) {
  return feed.all(function(err, results) {
    if (err) { throw err; }
    callback && callback(results.reverse());
  })
};
