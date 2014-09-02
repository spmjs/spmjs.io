var path = require('path');
var Datastore = require('nedb');
var feed = new Datastore({
  filename: path.join(CONFIG.wwwroot, 'db', 'history.db'),
  autoload: true
});
var _ = require('lodash');
var moment = require('moment');

exports.add = function(data, callback) {
  feed.insert(data, function(err) {
    callback && callback();
  });
};

// stat useful data
exports.stat = function(callback, count) {
  count = count || 10;
  return feed.find({}).sort({ time: -1 }).limit(100).exec(function(err, results) {
    var res = [];
    var todayPublishes = [];

    for (var i in results) {
      var item = results[i];
      res.push(item);
      if (moment(item.time).isAfter(moment().startOf('day'))) {
        todayPublishes.push(item);
      }
    }
    res = _.uniq(res, function(feed) {
      return feed.name;
    });
    callback && callback(res.splice(0, count), todayPublishes.length);
  });
};

exports.getAll = function(callback) {
  return feed.find({}).exec(function(err, results) {
    callback && callback(results.reverse());
  });
};

exports.updateAfter = function(datetime, callback) {
  return feed
    .find({ time: {$gt: datetime} })
    .sort({ time: 1 })
    .exec(function(err, results) {
      var res = _.uniq(results.map(function(item) {
        return item.name;
      }));
      if (callback) {
        callback(res);
      }
    });
};
