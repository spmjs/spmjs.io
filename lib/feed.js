var path = require('path');
var nStore = require('nstore');
nStore = nStore.extend(require('nstore/query')());
var feed = nStore.new(path.join(CONFIG.wwwroot, 'db', 'feed.db'));
var _ = require('lodash');
var moment = require('moment');

exports.add = function(data, callback) {
  feed.save(null, data, function(err) {
    callback && callback();
  });
};

// stat useful data
exports.stat = function(callback, count) {
  count = count || 10;
  return feed.all(function(err, results) {
    var res = [];
    var tempSubmitors = {};
    var submitors = [];
    var todayPublishes = [];

    for (var i in results) {
      var item = results[i];
      res.push(item);
      if (item.publisher) {
        tempSubmitors[item.publisher] = tempSubmitors[item.publisher] || 0;
        tempSubmitors[item.publisher] += 1;
      }
      if (moment(item.time).diff(moment(), 'days') < 1) {
        todayPublishes.push(item);
      }
    }
    res = _.uniq(res, function(feed) {
      return feed.name;
    });
    res = res.reverse();
    Object.keys(tempSubmitors).forEach(function(key) {
      submitors.push({
        account: key,
        count: tempSubmitors[key]
      });
    });
    submitors = submitors.sort(function(a, b) {
      return b.count - a.count;
    });
    callback &&
      callback(res.splice(0, count), submitors.splice(0, count), todayPublishes.length);
  });
};

exports.getAll = function(callback) {
  return feed.all(function(err, results) {
    callback && callback(results.reverse());
  })
};
